# app.py
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS
from groq import Groq
from dotenv import load_dotenv
import mysql.connector # Import MySQL connector

# Load environment variables (like GROQ_API_KEY) from .env file
load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for all origins

# --- Groq API Configuration ---
try:
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY not found in .env file or environment variables.")
    groq_client = Groq(api_key=groq_api_key)
    GROQ_MODEL = 'llama3-8b-8192'
    print("Groq client initialized.")
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    groq_client = None

# --- Database Credentials ---
DB_HOST = "localhost"
DB_NAME = "flexora_db"
DB_USER = "root"
DB_PASS = "vk1234"

# --- Role to Skill Mapping ---
ROLE_SKILL_MAP = {
    "web developer": ["html", "css", "javascript", "frontend"],
    "website developer": ["html", "css", "javascript", "frontend"],
    "frontend developer": ["html", "css", "javascript", "frontend", "react", "vue", "angular"],
    "python developer": ["python", "backend", "api"],
    "backend developer": ["python", "java", "node", "ruby", "php", "backend", "api"],
    "graphic designer": ["photoshop", "illustrator", "design", "logo design", "branding"],
    "developer": ["programming", "software", "code"],
    "designer": ["design", "ui", "ux"]
}

def query_database(search_criteria):
    """
    Queries your MySQL database based on structured criteria extracted by Groq,
    with added logic for role-to-skill expansion. Assumes INR currency.
    Args:
        search_criteria (dict): Structured data like {'type': '...', 'skills': [...], 'role': '...', 'budget_min_inr': ..., 'budget_max_inr': ...}
    Returns:
        list: A list of matching freelancer profiles or job postings.
    """
    print(f"Attempting DB Query with Criteria: {search_criteria}")

    conn = None
    cursor = None
    matches = []
    search_type = search_criteria.get('type')

    try:
        conn = mysql.connector.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cursor = conn.cursor(dictionary=True)
        print("Database connection successful.")

        base_query = ""
        conditions = []
        query_params = []

        is_client_search = search_type == 'client_search'
        if is_client_search:
            base_query = "SELECT id, name, email, profile_summary, role, skills, hourly_rate, availability, portfolio_url FROM freelancers WHERE 1=1"
            role_column = "role"
            skills_column = "skills"
        else: # Freelancer search
            base_query = "SELECT id, title, description, role_needed, required_skills, budget_min, budget_max, project_type, status FROM job_postings WHERE 1=1"
            role_column = "role_needed"
            skills_column = "required_skills"
            conditions.append("status = %s")
            query_params.append('open')

        extracted_role = search_criteria.get('role')
        if extracted_role and isinstance(extracted_role, str):
            conditions.append(f"{role_column} LIKE %s")
            query_params.append(f"%{extracted_role}%")
            role_key_for_map = extracted_role.lower()
        else:
            role_key_for_map = None

        skills_to_search = set()
        extracted_skills = search_criteria.get('skills')
        if isinstance(extracted_skills, list):
            for skill in extracted_skills:
                if skill and isinstance(skill, str):
                    skills_to_search.add(skill.lower())

        if role_key_for_map:
            if role_key_for_map in ROLE_SKILL_MAP:
                skills_to_search.update(ROLE_SKILL_MAP[role_key_for_map])
            for keyword in role_key_for_map.split():
                 if keyword in ROLE_SKILL_MAP:
                      skills_to_search.update(ROLE_SKILL_MAP[keyword])

        if skills_to_search:
            skill_conditions = []
            skill_params = []
            for skill in skills_to_search:
                 if skill:
                     skill_conditions.append(f"JSON_CONTAINS({skills_column}, %s)")
                     skill_params.append(json.dumps(skill))

            if skill_conditions:
                conditions.append(f"({' OR '.join(skill_conditions)})")
                query_params.extend(skill_params)

        # --- Handle Budget Filtering (Using INR keys) ---
        if is_client_search and 'budget_max_inr' in search_criteria and search_criteria['budget_max_inr'] is not None:
            try:
                 budget_max = float(search_criteria['budget_max_inr'])
                 conditions.append("hourly_rate <= %s")
                 query_params.append(budget_max)
            except (ValueError, TypeError):
                 print(f"Warning: Invalid budget_max_inr received: {search_criteria['budget_max_inr']}")
        elif not is_client_search and 'budget_min_inr' in search_criteria and search_criteria['budget_min_inr'] is not None:
             try:
                budget_min = float(search_criteria['budget_min_inr'])
                conditions.append("(budget_max >= %s OR budget_min >= %s)")
                query_params.append(budget_min)
                query_params.append(budget_min)
             except (ValueError, TypeError):
                print(f"Warning: Invalid budget_min_inr received: {search_criteria['budget_min_inr']}")

        # --- Combine conditions and Finalize Query ---
        if conditions:
            if len(conditions) > 0:
                 final_query = base_query + " AND " + " AND ".join(conditions)
            else:
                 final_query = base_query
        else:
             final_query = base_query

        final_query += " ORDER BY created_at DESC LIMIT 10"

        print(f"Executing SQL: {final_query}")
        print(f"With Params: {query_params}")

        cursor.execute(final_query, tuple(query_params))
        matches = cursor.fetchall()

        for match in matches:
            if skills_column in match and isinstance(match[skills_column], (str, bytes)):
                try: match[skills_column] = json.loads(match[skills_column])
                except json.JSONDecodeError: match[skills_column] = []

    except mysql.connector.Error as err:
        print(f"MySQL Error: {err}")
    except Exception as e:
        print(f"An error occurred in query_database: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
            print("MySQL connection closed.")

    print(f"Returning {len(matches)} matches.")
    return matches


# --- API Endpoint ---
@app.route('/api/search', methods=['POST'])
def handle_search():
    if not groq_client:
        return jsonify({"error": "Groq client not initialized"}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON request body"}), 400

    query = data.get('query')
    search_type = data.get('type')

    if not query or not search_type:
        return jsonify({"error": "Missing 'query' or 'type' in request"}), 400

    structured_criteria = {'type': search_type}
    try:
        # --- REFINED PROMPT FOR INR MVP ---
        prompt = f"""
        Analyze the search query: "{query}"
        This query is for a freelancer marketplace primarily targeting an Indian audience ({search_type}). Currency context is Indian Rupees (INR, ₹).

        Extract the following details and provide ONLY a valid JSON object as output. Do not include any explanations or surrounding text.
        - "type": Should be "{search_type}".
        - "role": Extract the primary job role or title mentioned (e.g., "web developer", "python developer", "graphic designer"). Output as a lowercase string. If no specific role, omit this key or set to null.
        - "skills": Extract specific technical skills, tools, or concepts mentioned, separate from the role. Output as a JSON list of lowercase strings. If none found, use an empty list [].
        - "budget_min_inr": Extract the minimum budget/rate mentioned. Assume INR or look for ₹/Rs. Output as a number. Omit if not found.
        - "budget_max_inr": Extract the maximum budget/rate mentioned (e.g., "under 50000", "less than 20k"). Assume INR or look for ₹/Rs. Output as a number. Omit if not found.

        Examples:
        Query: "python developer under ₹50000" -> {{"type": "{search_type}", "skills": ["python"], "role": "python developer", "budget_max_inr": 50000}}
        Query: "logo designer rate 1500/hr" -> {{"type": "{search_type}", "role": "graphic designer", "skills": ["logo design"], "budget_min_inr": 1500, "budget_max_inr": 1500}}
        Query: "website developer using react" -> {{"type": "{search_type}", "role": "website developer", "skills": ["react"]}}
        Query: "Data entry job" -> {{"type": "{search_type}", "role": "data entry"}}

        Input Query: "{query}"
        Output JSON:
        """
        # --- END REFINED PROMPT ---

        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=GROQ_MODEL,
            temperature=0.1,
            response_format={'type': 'json_object'}
        )

        response_content = chat_completion.choices[0].message.content
        print(f"Groq Raw Response: {response_content}")

        try:
            extracted_data = json.loads(response_content)
            if not isinstance(extracted_data, dict):
                raise ValueError("Response was not a JSON object.")

            # Safely merge extracted data, looking for _inr keys now
            structured_criteria['role'] = extracted_data.get('role')
            structured_criteria['budget_min_inr'] = extracted_data.get('budget_min_inr') # Using _inr
            structured_criteria['budget_max_inr'] = extracted_data.get('budget_max_inr') # Using _inr

            skills = extracted_data.get('skills')
            if isinstance(skills, list):
                structured_criteria['skills'] = [str(s).lower() for s in skills if isinstance(s, str) and s]
            else:
                 structured_criteria['skills'] = []

        except (json.JSONDecodeError, ValueError) as json_e:
             print(f"Failed to parse JSON from Groq response: {json_e}")


    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return jsonify({"error": "AI processing failed"}), 500

    # --- Step 2: Query Database ---
    try:
        matches = query_database(structured_criteria)
        return jsonify({"matches": matches})

    except Exception as e:
        print(f"Database query failed after calling query_database: {e}")
        return jsonify({"error": "Failed to retrieve matches from database"}), 500


# --- Run the App ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
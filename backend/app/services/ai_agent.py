import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Primary — GitHub Models (GPT-4o)
github_client = OpenAI(
    base_url="https://models.inference.ai.azure.com",
    api_key=os.getenv("GITHUB_TOKEN")
)

# Fallback — Groq (Llama 3.1)
try:
    from groq import Groq
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    GROQ_AVAILABLE = True
except Exception:
    GROQ_AVAILABLE = False


def generate_whatsapp_message(customer_name, amount_due, shop_name, language="roman_urdu"):
    if language == "roman_urdu":
        lang_instruction = """Write ONLY in Roman Urdu (Urdu words written in English letters).
Example style: 'Assalam o Alaikum Imran bhai, aap ki taraf se 1500 rupay baaki hain. Meherbani kar ke jald ada kar dein. Shukriya.'
Do NOT use Hindi words like 'kripaya' or 'dhanyawaad'. Use proper Pakistani Urdu words like 'meherbani', 'shukriya', 'ada karen'."""
    else:
        lang_instruction = "Write in simple professional English."

    prompt = f"""Generate a short WhatsApp payment reminder message.
Shop: {shop_name}
Customer: {customer_name}
Amount due: Rs. {amount_due}

{lang_instruction}

Rules:
- Under 50 words
- Warm and respectful tone
- Do not use formal Hindi words
- Return the message text only, no quotes around it"""

    # Try GitHub Models first
    try:
        response = github_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"GitHub Models failed: {e}, falling back to Groq")

    # Fallback to Groq
    if GROQ_AVAILABLE:
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Groq also failed: {e}")

    # Last resort — hardcoded fallback
    if language == "roman_urdu":
        return f"Assalam o Alaikum {customer_name} bhai, aap ki taraf se Rs. {amount_due:,.0f} baaki hain. Meherbani kar ke jald ada kar dein. Shukriya — {shop_name}"
    else:
        return f"Dear {customer_name}, this is a reminder that Rs. {amount_due:,.0f} is outstanding at {shop_name}. Kindly arrange payment at your earliest convenience. Thank you."


def generate_cashflow_insight(cashflow_data, shop_name):
    prompt = f"""You are a financial advisor for a small Pakistani shopkeeper.
Shop: {shop_name}
Total outstanding: Rs. {cashflow_data['total_outstanding']}
At risk amount: Rs. {cashflow_data['at_risk_amount']}
Shortage warning: {cashflow_data['shortage_warning']}
Customers at risk: {len(cashflow_data['customers_at_risk'])}

Give 2-3 short practical action points in simple English.
Under 80 words. Plain text only. No bullet points."""

    # Try GitHub Models first
    try:
        response = github_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"GitHub Models failed: {e}, falling back to Groq")

    # Fallback to Groq
    if GROQ_AVAILABLE:
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Groq also failed: {e}")

    return f"Total outstanding is Rs. {cashflow_data['total_outstanding']:,.0f} with Rs. {cashflow_data['at_risk_amount']:,.0f} at risk. Focus on collecting from high-risk customers this week."
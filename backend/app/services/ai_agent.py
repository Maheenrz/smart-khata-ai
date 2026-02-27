from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_whatsapp_message(customer_name, amount_due, shop_name, language="roman_urdu"):
    if language == "roman_urdu":
        lang_instruction = "Write in Roman Urdu. Keep it friendly and respectful."
    else:
        lang_instruction = "Write in English. Keep it friendly and professional."

    prompt = f"""Generate a short WhatsApp reminder for a shopkeeper in Pakistan.
Shop: {shop_name}
Customer: {customer_name}  
Amount due: Rs. {amount_due}
{lang_instruction}
Under 50 words. Warm tone. Return message text only."""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150
    )
    return response.choices[0].message.content.strip()


def generate_cashflow_insight(cashflow_data, shop_name):
    prompt = f"""You are a financial advisor for a small Pakistani shopkeeper.
Shop: {shop_name}
Total outstanding: Rs. {cashflow_data['total_outstanding']}
At risk amount: Rs. {cashflow_data['at_risk_amount']}
Shortage warning: {cashflow_data['shortage_warning']}
Customers at risk: {len(cashflow_data['customers_at_risk'])}

Give 2-3 short practical action points in simple English. Under 80 words. Plain text only."""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200
    )
    return response.choices[0].message.content.strip()
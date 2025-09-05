from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Loan App (Weekly Installments)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

# -------------------------
# Models
# -------------------------
class Loan(BaseModel):
    borrower_id: str   # <- new field
    borrower: str
    amount: float
    interest: float
    weeks: int
    start_date: str  # Changed to str for compatibility

class Payment(BaseModel):
    loan_id: int
    week: int
    amount: float

# -------------------------
# Loans Routes
# -------------------------
@app.get("/loans")
def get_loans():
    try:
        response = supabase.table("loans").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/loans")
def add_loan(loan: Loan):
    try:
        loan_dict = loan.dict()
        response = supabase.table("loans").insert(loan_dict).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/loans/{loan_id}")
def delete_loan(loan_id: int):
    # Check if loan exists
    response = supabase.table("loans").select("*").eq("id", loan_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Loan not found")
    # Delete loan
    supabase.table("loans").delete().eq("id", loan_id).execute()
    # Delete related payments
    supabase.table("payments").delete().eq("loan_id", loan_id).execute()
    return {"detail": f"Loan {loan_id} deleted"}

# -------------------------
# Payments Routes
# -------------------------
@app.get("/payments")
def get_payments():
    try:
        response = supabase.table("payments").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/payments")
def add_payment(payment: Payment):
    payment_dict = payment.dict()
    response = supabase.table("payments").insert(payment_dict).execute()
    return response.data[0]

@app.delete("/payments/{payment_id}")
def delete_payment(payment_id: int):
    response = supabase.table("payments").select("*").eq("id", payment_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Payment not found")
    supabase.table("payments").delete().eq("id", payment_id).execute()
    return {"detail": f"Payment {payment_id} deleted"}

# Handler for Vercel
from mangum import Mangum
handler = Mangum(app, lifespan="off")

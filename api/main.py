from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

# Mount static files
app.mount("/static", StaticFiles(directory="../static"), name="static")

# Get environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("❌ Missing Supabase environment variables")
    supabase = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    print("✅ Supabase client connected")

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
# Frontend Routes
# -------------------------
@app.get("/")
def read_root():
    return FileResponse("./index.html")

@app.get("/newloan.html")
def new_loan():
    return FileResponse("./newloan.html")

@app.get("/analysis.html")
def analysis():
    return FileResponse("./analysis.html")

@app.get("/weekly.html")
def weekly():
    return FileResponse("./weekly.html")

@app.get("/borrower_summary.html")
def borrower_summary():
    return FileResponse("./borrower_summary.html")

# -------------------------
# Loans Routes
# -------------------------
@app.get("/api/loans")
def get_loans():
    if supabase is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        response = supabase.table("loans").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/loans")
def add_loan(loan: Loan):
    if supabase is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        loan_dict = loan.model_dump()
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
@app.get("/api/payments")
def get_payments():
    if supabase is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        response = supabase.table("payments").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/payments")
def add_payment(payment: Payment):
    if supabase is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    payment_dict = payment.model_dump()
    response = supabase.table("payments").insert(payment_dict).execute()
    return response.data[0]

@app.delete("/api/payments/{payment_id}")
def delete_payment(payment_id: int):
    if supabase is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    response = supabase.table("payments").select("*").eq("id", payment_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Payment not found")
    supabase.table("payments").delete().eq("id", payment_id).execute()
    return {"detail": f"Payment {payment_id} deleted"}

# Handler for Vercel
from mangum import Mangum
handler = Mangum(app)

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting FastAPI server...")
    print("📱 Frontend: http://localhost:8000")
    print("🔗 API Docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)

import { NextResponse } from "next/server";
import { initializeAccounts } from "@/lib/initialize-accounts";

// Variable pour suivre si l'initialisation a été effectuée
let accountsInitialized = false;

export async function GET() {
  // Éviter les initialisations multiples
  if (accountsInitialized) {
    return NextResponse.json({ status: "already_initialized" });
  }

  try {
    // Uniquement en développement ou si explicitement configuré
    if (process.env.NODE_ENV === 'development' || process.env.INITIALIZE_ACCOUNTS === 'true') {
      console.log("Initialisation des comptes via API route...");
      await initializeAccounts();
      console.log("Initialisation des comptes terminée via API route");
      accountsInitialized = true;
      return NextResponse.json({ status: "success" });
    } else {
      return NextResponse.json({ status: "skipped", reason: "not_dev_mode" });
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation des comptes:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: error instanceof Error ? error.message : "Erreur inconnue"
      }, 
      { status: 500 }
    );
  }
} 
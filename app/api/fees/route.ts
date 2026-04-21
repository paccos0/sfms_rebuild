import { NextRequest } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type Row = RowDataPacket & { fee_structure_id:number; academic_year_id:number; term_id:number; category_id:number; academic_year_name:string; term_name:string; category_name:string; admission_type:string; amount:number; amount_display:string; currency:string; notes:string|null; is_active:number; active_status:string; };

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]); if (authResult.response) return authResult.response;
  try {
    const [rows] = await db.query<Row[]>(`
      SELECT fs.fee_structure_id, fs.academic_year_id, fs.term_id, fs.category_id, ay.name AS academic_year_name, t.name AS term_name, sc.category_name, fs.admission_type, fs.amount, FORMAT(fs.amount, 0) AS amount_display, fs.currency, fs.notes, fs.is_active, CASE WHEN fs.is_active = 1 THEN 'Yes' ELSE 'No' END AS active_status
      FROM fee_structure fs
      INNER JOIN academic_year ay ON ay.academic_year_id = fs.academic_year_id
      INNER JOIN term t ON t.term_id = fs.term_id
      INNER JOIN student_category sc ON sc.category_id = fs.category_id
      ORDER BY ay.start_date DESC, t.term_id ASC, sc.category_name ASC, fs.admission_type ASC
    `);
    return successResponse({ items: rows }, "Fee structures fetched successfully");
  } catch (error) {
    console.error("Fees GET route error:", error);
    return errorResponse("Unable to fetch fee structures", 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const body=await request.json();
    if(!body.academic_year_id || !body.term_id || !body.category_id || !body.admission_type || body.amount === null || body.amount === undefined) return errorResponse("academic_year_id, term_id, category_id, admission_type and amount are required",422);
    const [result]=await db.query<ResultSetHeader>(`INSERT INTO fee_structure (academic_year_id, term_id, category_id, admission_type, amount, currency, is_active, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [body.academic_year_id, body.term_id, body.category_id, body.admission_type, body.amount, body.currency || 'RWF', body.is_active === 0 ? 0 : 1, body.notes || null]);
    return successResponse({ fee_structure_id: result.insertId }, "Fee structure created successfully", 201);
  } catch (error:any) {
    console.error("Fees POST route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to create fee structure", 500);
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const body=await request.json();
    if(!body.fee_structure_id || !body.academic_year_id || !body.term_id || !body.category_id || !body.admission_type || body.amount === null || body.amount === undefined) return errorResponse("fee_structure_id, academic_year_id, term_id, category_id, admission_type and amount are required",422);
    await db.query(`UPDATE fee_structure SET academic_year_id=?, term_id=?, category_id=?, admission_type=?, amount=?, currency=?, is_active=?, notes=? WHERE fee_structure_id=?`, [body.academic_year_id, body.term_id, body.category_id, body.admission_type, body.amount, body.currency || 'RWF', body.is_active === 0 ? 0 : 1, body.notes || null, body.fee_structure_id]);
    return successResponse({}, "Fee structure updated successfully");
  } catch (error:any) {
    console.error("Fees PUT route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to update fee structure", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const id=request.nextUrl.searchParams.get("id"); if(!id) return errorResponse("id is required",422);
    await db.query(`DELETE FROM fee_structure WHERE fee_structure_id=?`, [id]);
    return successResponse({}, "Fee structure deleted successfully");
  } catch (error:any) {
    console.error("Fees DELETE route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to delete fee structure", 500);
  }
}

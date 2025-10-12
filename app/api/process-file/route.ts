import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Process the file based on type (return or remittance)
    console.log(`Processing ${type} file:`, file.name)

    // Add your file processing logic here
    // For example: parse the file, extract data, store in database, etc.

    return NextResponse.json({
      success: true,
      message: `${type} file processed successfully`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 })
  }
}

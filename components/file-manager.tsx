"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileData {
  id: string
  codBarras?: string
  numDocumento?: string
  valorDocumento?: string
  dataVencimento?: string
  dataProcessamento?: string
  nomeParceiro?: string
  status: string,
  dataBaixa?: string
}

export default function FileManager() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [registroFinanceiroFiles, setRegistroFinanceiroFiles] = useState<FileData[]>([])
  const [remessaFiles, setRemessaFiles] = useState<FileData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Fetch dados do endpoint no mount do componente
  useEffect(() => {
    const fetchFinanceiroData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/financeiro/listar", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`)
        }

        const data = await response.json()
        console.log("[FileManager] Dados carregados do backend:", data)

        // Mapeia para FileData com formatação
        const mappedData = data.map((item: any) => ({
          id: item.id.toString(),
          codBarras: item.codBarras,
          numDocumento: item.numDoc.toString(),
          valorDocumento: `R$ ${parseFloat(item.vlrDoc).toFixed(2).replace('.', ',')}`,
          dataVencimento: new Date(item.dtVen).toLocaleDateString('pt-BR'),
          dataProcessamento: new Date(item.dtPros).toLocaleDateString('pt-BR'),
          nomeParceiro: item.nomeParc,
          status: item.status === 0 ? 'Pendente' : 'Processado',
          dataBaixa: item.dtBaixa ? new Date(item.dtBaixa).toLocaleDateString('pt-BR') : undefined,
        }))

        setRegistroFinanceiroFiles(mappedData)

        toast({
          title: "Dados carregados",
          description: `${data.length} registros financeiros foram carregados com sucesso.`,
        })
      } catch (error) {
        console.error("[FileManager] Erro ao carregar dados:", error)
        toast({
          title: "Erro ao carregar dados",
          description: "Falha ao buscar registros financeiros do servidor.",
          variant: "destructive",
        })
      }
    }

    fetchFinanceiroData()
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith(".txt")) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Somente arquivos .txt são permitidos.",
          variant: "destructive",
        })
        // Clear the input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }

      setSelectedFile(file)
      toast({
        title: "Arquivo selecionado",
        description: `${file.name} está pronto para upload`,
      })
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith(".txt")) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Somente arquivos .txt são permitidos.",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      toast({
        title: "Arquivo selecionado",
        description: `${file.name} está pronto para upload`,
      })
    }
  }

  const processFile = async (fileType: "return" | "remittance") => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo primeiro",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate backend API call
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", fileType)

      // Simulated API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newFile: FileData = {
        id: Math.random().toString(36).substr(2, 9),
        codBarras: "123456789",
        numDocumento: "987654321",
        valorDocumento: "R$ 1.000,00",
        dataVencimento: "2024-12-31",
        dataProcessamento: new Date().toLocaleDateString(),
        nomeParceiro: "Parceiro Exemplo",
        dataBaixa: new Date().toLocaleDateString(),
        status: "Processado",
      }

      if (fileType === "return") {
        setRemessaFiles((prev) => [...prev, newFile])
      } else {
        setRegistroFinanceiroFiles((prev) => [...prev, newFile])
      }

      toast({
        title: "Arquivo processado com sucesso",
        description: `${selectedFile.name} foi adicionado à fila de ${fileType} arquivos`,
      })

      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      toast({
        title: "Falha no processamento",
        description: "Ocorreu um erro ao processar seu arquivo",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRowClick = async (file: FileData, type: "remessa" | "registro financeiro") => {
    try {
      console.log("[v0] Fetching file data for:", file.codBarras, "Type:", type)

      toast({
        title: "Buscando dados do arquivo",
        description: `Carregando ${file.codBarras}...`,
      })

      // Replace with actual API endpoint
      const response = await fetch("/api/get-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: file.id,
          fileType: type,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch file data")
      }

      const data = await response.json()
      console.log("[v0] File data retrieved:", data)

      toast({
        title: "File data retrieved",
        description: `Successfully loaded ${file.codBarras}`,
      })
    } catch (error) {
      console.error("[v0] Error fetching file:", error)
      toast({
        title: "Error",
        description: "Failed to retrieve file data",
        variant: "destructive",
      })
    }
  }

  const FileTable = ({ files, type }: { files: FileData[]; type: "remessa" | "registro financeiro" }) => {
    if (files.length === 0) {
      return (
        <Card className="border-4 border-primary bg-muted p-8 text-center">
          <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-base font-semibold text-muted-foreground">Sem arquivos de {type} enviados ainda</p>
        </Card>
      )
    }

    return (
      <div className="overflow-x-auto border-4 border-primary">
        <table className="w-full">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="border-r-2 border-primary-foreground/20 px-4 py-3 text-left text-sm font-bold uppercase">
                Codigo de Barras
              </th>
              <th className="border-r-2 border-primary-foreground/20 px-4 py-3 text-left text-sm font-bold uppercase">
                Numero do Documento
              </th>
              <th className="border-r-2 border-primary-foreground/20 px-4 py-3 text-left text-sm font-bold uppercase">
                Valor do Documento
              </th>
              <th className="border-r-2 border-primary-foreground/20 px-4 py-3 text-left text-sm font-bold uppercase">
                Data de Vencimento
              </th>
              <th className="border-r-2 border-primary-foreground/20 px-4 py-3 text-left text-sm font-bold uppercase">
                Data de Processamento
              </th>
              <th className="border-r-2 border-primary-foreground/20 px-4 py-3 text-left text-sm font-bold uppercase">
                Nome Parceiro
              </th>
              <th className="border-r-2 border-primary-foreground/20 px-4 py-3 text-left text-sm font-bold uppercase">
                Status
              </th>
              {type === "registro financeiro" &&
                <th className="border-r-2 border-primary-foreground/20 px-4 py-3 text-left text-sm font-bold uppercase">
                  Data Baixado
                </th>}

            </tr>
          </thead>
          <tbody className="bg-background">
            {files.map((file, index) => (
              <tr
                key={file.id}
                onClick={() => handleRowClick(file, type)}
                className={`cursor-pointer transition-colors hover:bg-muted ${index !== files.length - 1 ? "border-b-2 border-primary" : ""
                  }`}
              >
                <td className="px-4 py-3 text-sm font-medium text-foreground">{file.codBarras}</td>
                <td className="px-4 py-3 text-sm text-foreground">{file.numDocumento}</td>
                <td className="px-4 py-3 text-sm text-foreground">{file.valorDocumento}</td>
                <td className="px-4 py-3 text-sm text-foreground">{file.dataVencimento}</td>
                <td className="px-4 py-3 text-sm text-foreground">{file.dataProcessamento}</td>
                <td className="px-4 py-3 text-sm text-foreground">{file.nomeParceiro}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    {file.status}
                  </span>
                </td>
                {
                  type === "registro financeiro" && <td className="px-4 py-3 text-sm text-foreground">{file.dataBaixa}</td>
                }
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 border-4 border-primary p-8">
        <h1 className="mb-6 font-sans text-2xl font-bold uppercase tracking-tight text-primary">Passo 1: Upload de Arquivo</h1>

        <p className="mb-6 text-base leading-relaxed text-foreground">
          Faça o upload do seu arquivo para processar dados de retorno ou remessa. Somente arquivos .txt são permitidos.
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
              accept=".txt"
            />
            <Button
              variant="outline"
              className="h-12 border-4 border-primary bg-background px-8 text-base font-bold uppercase text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Upload className="mr-2 h-5 w-5" />
              Arquivo de Upload
            </Button>
          </div>

          <Button
            onClick={() => processFile("return")}
            disabled={!selectedFile || isProcessing}
            className="h-12 border-0 bg-accent px-8 text-base font-bold uppercase text-accent-foreground hover:bg-accent/90"
          >
            Ler Arquivo de Remessa
          </Button>

          <Button
            onClick={() => processFile("remittance")}
            disabled={!selectedFile || isProcessing}
            className="h-12 border-0 bg-accent px-8 text-base font-bold uppercase text-accent-foreground hover:bg-accent/90"
          >
            Processar Arquivo de Retorno
          </Button>

          {isProcessing && <span className="text-sm text-muted-foreground">Processing...</span>}
        </div>

        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex h-24 items-center justify-center border-4 border-primary bg-background"
        >
          <p className="text-base font-semibold text-primary">
            {selectedFile ? selectedFile.name : "Arraste e solte seu arquivo aqui, ou clique no botão acima para selecionar um arquivo."}
          </p>
        </div>
      </div>

      <div className="border-4 border-primary p-8">
        <h2 className="mb-6 font-sans text-2xl font-bold uppercase tracking-tight text-primary">Passo 2: Visualizar Arquivos</h2>

        <Tabs defaultValue="remessa" className="w-full">
          <TabsList className="mb-6 h-auto w-full justify-start gap-2 border-b-4 border-primary bg-transparent p-0">
            <TabsTrigger
              value="remessa"
              className="border-4 border-primary bg-background px-6 py-3 text-base font-bold uppercase text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Arquivos de Remessa - DDA ({remessaFiles.length})
            </TabsTrigger>
            <TabsTrigger
              value="registro financeiro"
              className="border-4 border-primary bg-background px-6 py-3 text-base font-bold uppercase text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Registro Financeiro ({registroFinanceiroFiles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="remessa" className="mt-0">
            <FileTable files={remessaFiles} type="remessa" />
          </TabsContent>

          <TabsContent value="registro financeiro" className="mt-0">
            <FileTable files={registroFinanceiroFiles} type="registro financeiro" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
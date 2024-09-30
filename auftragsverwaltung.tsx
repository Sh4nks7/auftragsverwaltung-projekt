'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Auftrag = {
  id: string
  kunde: string
  adresse: string
  mieter: string
  telNr: string
  email: string
  problem: string
  pdfUrl: string
  status: string
}

type KachelProps = {
  title: string
  auftraege: Auftrag[]
  onEdit: (auftrag: Auftrag) => void
  onDelete: (id: string) => void
}

const Kachel = ({ title, auftraege, onEdit, onDelete }: KachelProps) => (
  <Droppable droppableId={title}>
    {(provided) => (
      <Card className="w-80 h-[calc(100vh-8rem)] flex-shrink-0" {...provided.droppableProps} ref={provided.innerRef}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          {auftraege.map((auftrag, index) => (
            <Draggable key={auftrag.id} draggableId={auftrag.id} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className="mb-2 p-2 bg-secondary rounded"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div {...provided.dragHandleProps}>
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(auftrag)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => onDelete(auftrag.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="font-semibold">{auftrag.kunde}</p>
                  <p className="text-sm">{auftrag.problem}</p>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </CardContent>
      </Card>
    )}
  </Droppable>
)

export default function Auftragsverwaltung() {
  const [auftraege, setAuftraege] = useState<Auftrag[]>([])
  const [kacheln] = useState(['Offen', 'In Bearbeitung', 'Termin', 'Nochmal vorbeigehen', 'Erledigt', 'Rechnung'])
  const [neuerAuftrag, setNeuerAuftrag] = useState<Omit<Auftrag, 'id' | 'status'>>({
    kunde: '', adresse: '', mieter: '', telNr: '', email: '', problem: '', pdfUrl: ''
  })
  const [bearbeiteterAuftrag, setBearbeiteterAuftrag] = useState<Auftrag | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (bearbeiteterAuftrag) {
      setBearbeiteterAuftrag({ ...bearbeiteterAuftrag, [name]: value })
    } else {
      setNeuerAuftrag({ ...neuerAuftrag, [name]: value })
    }
  }

  const handleSubmit = () => {
    if (bearbeiteterAuftrag) {
      setAuftraege(auftraege.map(a => a.id === bearbeiteterAuftrag.id ? bearbeiteterAuftrag : a))
    } else {
      const newAuftrag = { ...neuerAuftrag, id: Date.now().toString(), status: 'Offen' }
      setAuftraege([...auftraege, newAuftrag])
    }
    setIsDialogOpen(false)
    setNeuerAuftrag({ kunde: '', adresse: '', mieter: '', telNr: '', email: '', problem: '', pdfUrl: '' })
    setBearbeiteterAuftrag(null)
  }

  const handleEdit = (auftrag: Auftrag) => {
    setBearbeiteterAuftrag(auftrag)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setAuftraege(auftraege.filter(a => a.id !== id))
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) {
      return
    }

    const newAuftraege = Array.from(auftraege)
    const [reorderedItem] = newAuftraege.splice(
      newAuftraege.findIndex(auftrag => auftrag.id === result.draggableId),
      1
    )

    reorderedItem.status = destination.droppableId
    newAuftraege.splice(
      newAuftraege.filter(auftrag => auftrag.status === destination.droppableId).length,
      0,
      reorderedItem
    )

    setAuftraege(newAuftraege)
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Auftragsverwaltung</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Neuer Auftrag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{bearbeiteterAuftrag ? 'Auftrag bearbeiten' : 'Neuer Auftrag'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input name="kunde" placeholder="Kunde" value={bearbeiteterAuftrag?.kunde || neuerAuftrag.kunde} onChange={handleInputChange} />
              <Input name="adresse" placeholder="Adresse" value={bearbeiteterAuftrag?.adresse || neuerAuftrag.adresse} onChange={handleInputChange} />
              <Input name="mieter" placeholder="Mieter" value={bearbeiteterAuftrag?.mieter || neuerAuftrag.mieter} onChange={handleInputChange} />
              <Input name="telNr" placeholder="Tel. Nr." value={bearbeiteterAuftrag?.telNr || neuerAuftrag.telNr} onChange={handleInputChange} />
              <Input name="email" placeholder="E-Mail" value={bearbeiteterAuftrag?.email || neuerAuftrag.email} onChange={handleInputChange} />
              <Textarea name="problem" placeholder="Problem" value={bearbeiteterAuftrag?.problem || neuerAuftrag.problem} onChange={handleInputChange} />
              <Input name="pdfUrl" type="file" accept=".pdf" onChange={(e) => handleInputChange({ target: { name: 'pdfUrl', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)} />
            </div>
            <Button onClick={handleSubmit}>{bearbeiteterAuftrag ? 'Aktualisieren' : 'Hinzufügen'}</Button>
          </DialogContent>
        </Dialog>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {kacheln.map(kachel => (
            <Kachel 
              key={kachel} 
              title={kachel} 
              auftraege={auftraege.filter(a => a.status === kachel)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/pages/Announcements.jsx');
let content = fs.readFileSync(file, 'utf8');

const editDialog = `
      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={v => { setShowEdit(v); if (!v) { setEditingId(null); setForm(EMPTY_FORM); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-heading">Editar Publicação</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Tipo</Label>
              <Select value={form.Tipo} onValueChange={v => upd("Tipo", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Título *</Label>
              <Input value={form.Titulo} onChange={e => upd("Titulo", e.target.value)} className="mt-1" />
            </div>
            <div><Label>Mensagem / Descrição</Label>
              <Textarea value={form.Mensagem} onChange={e => upd("Mensagem", e.target.value)} className="mt-1 min-h-[80px]" />
            </div>
            <div><Label>URL da Imagem <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input value={form.Imagem_URL} onChange={e => upd("Imagem_URL", e.target.value)} className="mt-1" placeholder="https://..." />
            </div>
            <div><Label>Visibilidade *</Label>
              <Select value={form.Visibilidade} onValueChange={v => upd("Visibilidade", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{VISIBILIDADES.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {(form.Visibilidade === "Interno" || form.Visibilidade === "Ambos") && (
              <div><Label>Público Interno</Label>
                <Select value={form.Escopo} onValueChange={v => upd("Escopo", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Global">🌍 Todos os Membros</SelectItem>
                    <SelectItem value="Ministerio">⛪ Apenas um Ministério</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {form.Escopo === "Ministerio" && (form.Visibilidade === "Interno" || form.Visibilidade === "Ambos") && (
              <div><Label>Ministério</Label>
                <Select value={form.ID_Ministerio_Alvo} onValueChange={v => upd("ID_Ministerio_Alvo", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{allowedMin.map(m => <SelectItem key={m.id} value={m.id}>{m.Nome_Ministerio}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleUpdate} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>`;

// Insert before the closing </div>\n  );\n}
const closingTag = '    </div>\n  );\n}';
const closingTagCRLF = '    </div>\r\n  );\r\n}';

if (content.includes(closingTagCRLF)) {
  content = content.replace(closingTagCRLF, editDialog + '\n' + closingTag.replace(/\n/g, '\r\n'));
} else {
  content = content.replace(closingTag, editDialog + '\n' + closingTag);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done. New size:', fs.statSync(file).size);

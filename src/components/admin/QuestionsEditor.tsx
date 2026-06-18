import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Trash2, Plus } from "lucide-react";

export type Question = {
  id?: string;
  text: string;
  options?: { id: string; text: string }[];
  note?: string;
}

export default function QuestionsEditor({
  questions,
  onChange
}: {
  questions: Question[],
  onChange: (questions: Question[]) => void
}) {
  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    const opts = [...(updated[qIndex].options || [])];
    opts[optIndex] = { ...opts[optIndex], text };
    updated[qIndex] = { ...updated[qIndex], options: opts };
    onChange(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    onChange(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    const opts = updated[qIndex].options || [];
    updated[qIndex].options = [...opts, { id: `${Date.now()}`, text: '' }];
    onChange(updated);
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    const opts = [...(updated[qIndex].options || [])];
    opts.splice(optIndex, 1);
    updated[qIndex].options = opts;
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="bg-background border border-border rounded-lg p-5 relative group">
          
          <div className="absolute top-4 left-4">
            <Button 
              type="button" 
              variant="destructive" 
              size="icon" 
              className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeQuestion(qIndex)}
              title="حذف السؤال"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-4 pr-2">
            <label className="text-sm font-bold block mb-1">نص السؤال {qIndex + 1}</label>
            <Input 
              value={q.text} 
              onChange={(e) => updateQuestion(qIndex, { text: e.target.value })} 
              required
            />
          </div>

          {q.options && (
            <div className="mb-4 space-y-2 bg-card-hover/20 p-3 rounded-md border border-border">
              <label className="text-sm font-bold block">خيارات الإجابة</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-8 text-center">{optIndex + 1}-</span>
                    <Input 
                      className="h-9 flex-1"
                      value={opt.text}
                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => removeOption(qIndex, optIndex)}
                      className="text-destructive hover:text-red-700 disabled:opacity-30"
                      disabled={q.options!.length <= 2}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2 text-xs gap-1" onClick={() => addOption(qIndex)}>
                <Plus className="w-3 h-3" /> إضافة خيار جديد
              </Button>
            </div>
          )}

          <div>
            <label className="text-sm font-bold block mb-1">ملاحظة توضيحية (اختياري)</label>
            <Input 
              className="h-9"
              value={q.note || ""} 
              onChange={(e) => updateQuestion(qIndex, { note: e.target.value })} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}

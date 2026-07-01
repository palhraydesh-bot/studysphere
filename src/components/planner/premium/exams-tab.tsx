"use client";

import React, { useState } from 'react';
import { useExamStore } from '@/store/exam-store';
import { ExamService } from '@/lib/planner/exam-service';
import { Exam } from '@/types/life-os';
import { GraduationCap, Calendar, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ExamsTabProps {
  userId: string;
}

export function ExamsTab({ userId }: { userId: string }) {
  const { exams } = useExamStore();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      toast.error('Please fulfill title descriptor and specific calendar parameters');
      return;
    }
    await ExamService.createExam(userId, title.trim(), 'default_subject', date, [
      'High-Yield Target Topic Alpha',
      'Core Assessment Matrix Subject B'
    ]);
    setTitle('');
    setDate('');
    toast.success('Exam evaluation workspace pinned');
  };

  const handleToggleTopic = async (exam: Exam, topicId: string, currentStatus: string) => {
    const targetStatus = currentStatus === 'mastered' ? 'unstarted' : 'mastered';
    await ExamService.updateTopicStatus(userId, exam, topicId, targetStatus);
    toast.success(`Topic updated to ${targetStatus}`);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid sm:flex gap-2 bg-card p-4 rounded-xl border shadow-sm">
        <input
          type="text"
          placeholder="Exam title description (e.g. IAS Mains Math)..."
          className="flex-1 px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground placeholder:text-muted-foreground"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        />
        <input
          type="date"
          className="px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground font-medium"
          value={date}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
        />
        <Button type="submit" variant="gradient" size="sm" className="gap-2 shrink-0">
          <GraduationCap className="h-4 w-4" /> Pin Assessment
        </Button>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {exams.length === 0 ? (
          <div className="md:col-span-2">
            <GlassCard>
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming examinations recorded yet. Map your syllabus requirements above.</p>
            </GlassCard>
          </div>
        ) : (
          exams.map(exam => {
            const daysLeft = Math.ceil((new Date(exam.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={exam.id} className="bg-card border rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-card-foreground truncate">{exam.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground font-medium">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>Target: {exam.examDate} ({daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Today' : 'Completed'})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="bg-primary/10 text-primary rounded-xl px-3 py-1.5 text-center border border-primary/20">
                      <span className="block font-bold text-base leading-none">{exam.readinessScore}%</span>
                      <span className="text-[8px] uppercase font-bold tracking-wider opacity-80 mt-0.5 block">Readiness</span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await ExamService.deleteExam(userId, exam.id);
                        toast.success('Exam configuration removed');
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/5 transition-colors focus:outline-none"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Syllabus Breakdown Matrix</span>
                  <div className="grid gap-1.5">
                    {exam.syllabusTopics.map(topic => (
                      <div key={topic.id} className="flex items-center justify-between text-xs bg-muted/40 px-3 py-1.5 rounded-lg border border-border/30">
                        <span className="font-medium text-foreground/90 truncate mr-2">{topic.name}</span>
                        <button 
                          type="button"
                          onClick={() => handleToggleTopic(exam, topic.id, topic.status)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors focus:outline-none ${
                            topic.status === 'mastered'
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-background hover:bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {topic.status === 'mastered' ? 'Mastered' : 'Mark Done'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
"use client";

import React, { useState } from 'react';
import { useExamStore } from '@/store/exam-store';
import { ExamService } from '@/lib/planner/exam-service';
import { GraduationCap, Calendar, Award, CheckCircle } from 'lucide-react';

export function ExamsTab({ userId }: { userId: string }) {
  const { exams } = useExamStore();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    ExamService.createExam(userId, title, 'default_subject', date, ['Syllabus Topic Core A', 'Syllabus Topic Core B']);
    setTitle('');
    setDate('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid sm:flex gap-2 bg-card p-4 rounded-xl border">
        <input
          type="text"
          placeholder="Exam title description..."
          className="flex-1 px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="date"
          className="px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-primary/95 transition-all whitespace-nowrap">
          <GraduationCap className="h-4 w-4" /> Pin Assessment
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {exams.map(exam => {
          const daysLeft = Math.ceil((new Date(exam.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={exam.id} className="bg-card border rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-card-foreground truncate">{exam.title}</h4>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Target: {exam.examDate} ({daysLeft > 0 ? `${daysLeft} days left` : 'Completed'})</span>
                  </div>
                </div>
                <div className="bg-primary/10 text-primary rounded-xl px-3 py-2 text-center shrink-0">
                  <span className="block font-bold text-lg leading-none">{exam.readinessScore}%</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 mt-0.5 block">Readiness</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Syllabus Breakdown</span>
                <div className="grid gap-1.5">
                  {exam.syllabusTopics.map(topic => (
                    <div key={topic.id} className="flex items-center justify-between text-xs bg-muted/40 px-3 py-2 rounded-lg">
                      <span className="font-medium text-muted-foreground/90 truncate mr-2">{topic.name}</span>
                      <button 
                        onClick={() => ExamService.updateTopicStatus(userId, exam, topic.id, topic.status === 'mastered' ? 'unstarted' : 'mastered')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          topic.status === 'mastered'
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-background hover:bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {topic.status === 'mastered' ? 'Mastered' : 'Mark Complete'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
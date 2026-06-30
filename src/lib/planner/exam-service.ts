import { db } from '@/lib/firebase/client';
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Exam, SyllabusTopic } from '@/types/life-os';
import { useExamStore } from '@/store/exam-store';

export const ExamService = {
  calculateReadiness(topics: SyllabusTopic[]): number {
    if (!topics || topics.length === 0) return 0;
    let totalPointsEarned = 0;
    let totalPossiblePoints = 0;

    topics.forEach((topic) => {
      const importanceWeight = topic.weight || 1;
      totalPossiblePoints += importanceWeight * 100;
      if (topic.status === 'mastered') {
        totalPointsEarned += importanceWeight * 100;
      } else if (topic.status === 'studying') {
        totalPointsEarned += importanceWeight * 50;
      }
    });

    return totalPossiblePoints > 0 ? Math.round((totalPointsEarned / totalPossiblePoints) * 100) : 0;
  },

  async createExam(userId: string, title: string, subjectId: string, examDate: string, topics: string[]): Promise<Exam> {
    const examRef = doc(collection(db, `users/${userId}/exams`));
    const syllabusTopics: SyllabusTopic[] = topics.map((name, index) => ({
      id: `topic_${index}_${Date.now()}`,
      name,
      status: 'unstarted',
      weight: 1,
    }));

    const newExam: Exam = {
      id: examRef.id,
      userId,
      title,
      subjectId,
      examDate,
      syllabusTopics,
      readinessScore: 0,
      createdAt: new Date(),
    };

    await setDoc(examRef, {
      ...newExam,
      createdAt: serverTimestamp()
    });
    useExamStore.getState().addExamLocal(newExam);
    return newExam;
  },

  async updateTopicStatus(userId: string, exam: Exam, topicId: string, newStatus: SyllabusTopic['status']): Promise<void> {
    const examRef = doc(db, `users/${userId}/exams`, exam.id);
    const updatedTopics = exam.syllabusTopics.map((topic) =>
      topic.id === topicId ? { ...topic, status: newStatus } : topic
    );

    const updatedScore = this.calculateReadiness(updatedTopics);

    await updateDoc(examRef, {
      syllabusTopics: updatedTopics,
      readinessScore: updatedScore,
    });

    useExamStore.getState().updateExamTransactionLocal(exam.id, {
      syllabusTopics: updatedTopics,
      readinessScore: updatedScore
    });
  },

  async deleteExam(userId: string, examId: string): Promise<void> {
    await deleteDoc(doc(db, `users/${userId}/exams`, examId));
    useExamStore.getState().removeExamLocal(examId);
  }
};
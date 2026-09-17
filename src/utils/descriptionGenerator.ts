import { Subject, Student } from '../types';

export function generateSubjectDescription(
  subject: Subject,
  score: number | null | undefined,
  _student?: Student
): string {
  if (score === null || score === undefined || isNaN(score)) {
    return '';
  }

  const mapel = subject.name;

  if (score >= 90) {
    return `Menunjukkan penguasaan yang istimewa dalam seluruh capaian pembelajaran ${mapel}, sangat mandiri, kreatif, dan memiliki pemahaman konsep yang mendalam.`;
  } else if (score >= 82) {
    return `Menunjukkan penguasaan yang sangat baik dalam mencapai tujuan pembelajaran ${mapel} dan aktif dalam menyelesaikan tugas dengan tepat.`;
  } else if (score >= 72) {
    return `Menunjukkan penguasaan yang baik dalam capaian pembelajaran ${mapel}, mampu mengikuti materi dengan cukup terarah dan konsisten.`;
  } else if (score >= 60) {
    return `Menunjukkan penguasaan yang cukup dalam ${mapel}, namun perlu peningkatan latihan dan pendampingan pada materi yang belum tuntas.`;
  } else {
    return `Perlu bimbingan dan pendampingan intensif dari guru dan orang tua dalam menguasai materi capaian pembelajaran dasar ${mapel}.`;
  }
}

export function generateAllDescriptionsForStudent(
  student: Student,
  subjects: Subject[],
  grades: Record<string, number | null>,
  existingDescriptions: Record<string, string>,
  overwriteManual: boolean = false
): Record<string, string> {
  const result: Record<string, string> = { ...existingDescriptions };

  subjects.forEach((subj) => {
    const currentDesc = existingDescriptions[subj.id];
    // If overwrite is false and description already exists and is not empty, PRESERVE it!
    if (!overwriteManual && currentDesc && currentDesc.trim() !== '') {
      return;
    }

    const score = grades[subj.id];
    if (score !== null && score !== undefined) {
      result[subj.id] = generateSubjectDescription(subj, score, student);
    }
  });

  return result;
}

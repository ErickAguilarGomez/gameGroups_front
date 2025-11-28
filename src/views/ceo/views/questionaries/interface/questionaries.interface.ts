export interface Questionary {
  id: number;
  title: string;
  questions?: Question[];
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  updated_by?: number;
  start_date: string;
  end_date: string;
  total_responses?: number;
  user_response_id?: number;
  user_question_id?: number;
}

export interface Question {
  id?: number;
  question: string;
  updated_at?: string;
  updated_by?: number;
  counter?: number;
  percentage?: number;
}

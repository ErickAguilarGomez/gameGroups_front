import backendApi from "@/api/backendApi";
import { Questionary } from "@/views/ceo/views/questionaries/interface/questionaries.interface";

export const questionariesService = {
  async getQuestionaries(params: { status: string }): Promise<Questionary[]> {
    const { data } = await backendApi.post("api/questionaries", params);
    return data;
  },
  async createQuestionary(questionary: Questionary): Promise<Questionary> {
    const { data } = await backendApi.post(
      "api/questionaries/store",
      questionary
    );
    return data;
  },
  async updateQuestionary(questionary: Questionary): Promise<Questionary> {
    const { data } = await backendApi.post(
      `api/questionaries/update`,
      questionary
    );
    return data;
  },
  async deleteQuestionary(params: { id: number }): Promise<any> {
    const { data } = await backendApi.post(`api/questionaries/destroy`, params);
    return data;
  },
  async getQuestionary(params: { id: number }): Promise<Questionary> {
    const { data } = await backendApi.post(`api/questionaries/show`, params);
    return data;
  },
  async getQuestionariesWithStats(params: {
    status: string;
    user_id: number;
  }): Promise<Questionary[]> {
    const { data } = await backendApi.post(
      `api/questionaries/show-with-stats`,
      params
    );
    return data;
  },
  async vote(params: {
    user_id: number;
    question_id: number;
    questionary_id: number;
  }): Promise<any> {
    const { data } = await backendApi.post(
      `api/questionaries/response/store`,
      params
    );
    return data;
  },
  async getUsersByOption(params: { question_id: number }): Promise<any[]> {
    const { data } = await backendApi.post(
      `api/questionaries/users-by-option`,
      params
    );
    return data;
  },
};

export type LifeAreaId =
  | "spirit"
  | "fit"
  | "experience"
  | "connect"
  | "happy"
  | "business"
  | "money"
  | "home";

export type LifeArea = {
  id: LifeAreaId;
  title: string;
  subtitle?: string;
};
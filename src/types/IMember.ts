import { IMemberTag } from "./IMemberTag";

export interface IMember {
  id: number;
  name: string;
  birthday: Date;
  imagePath: string;
  catchCopy: string;
  description: string;
  color: string;
  accentColor: string;
  tags: IMemberTag[];
}

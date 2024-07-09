export type RedtailModalProps = {
  title: string;
  detailText: string;
  fields: object;
}

export type Template = {
  filename: string;
  pdf_base64: string;
  field_json: object;
  description: string;
  form_category: string;
  last_used: Date;
  times_used: number;
  id: string;
}

export type FormBundle = {
  bundle_name: string;
  forms: Template[];
  id: string;
}
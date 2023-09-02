export type BlockToInsert = {
  children: BlockToInsert[];
  content: string;
  properties: {
    todoistid: string;
    attachments: string;
    comments: string;
  };
};

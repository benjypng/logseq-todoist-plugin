export declare type Task = {
  parent_id: number;
  id: number;
  content: string;
  description: string;
  due: {
    string: string;
    date: string;
    datetime: string;
  };
  comment_count: {
    fileUrl: string;
    fileName: string;
    fileType: string;
  };
};

export declare type Id = {
  id: number;
};

export declare type Task = {
  parent_id: number;
  id: number;
  content: string;
  description: string;
  due: {
    date: string;
    datetime: string;
  };
};

export declare type Id = {
  id: number;
};

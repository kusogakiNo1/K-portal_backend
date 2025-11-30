// バリデーションメッセージを定義しているファイル
export const ValidationMsg = {
  id: {
    unspecified: "idが未指定です。idを指定してください。",
    notInt: "idは数字で指定してください",
  },
  userName: {
    unspecified: "ユーザー名が入力されていません",
    invalidLength: "ユーザー名は1文字以上20文字以下で入力してください",
  },
  email: {
    unspecified: "メールアドレスが入力されていません",
    invalidLength: "メールアドレスは255文字以下のものにしてください",
    invalidFormat: "メールアドレスの形式が間違っています",
    notUnique: "このメールアドレスはすでに使われています。",
  },
  password: {
    unspecified: "パスワードが入力されていません",
    invalidLength: "パスワードは8文字以上255文字以下にしてください",
    invalidFormat:
      "パスワードは数字と半角英字の両方を用いるようにしてください。また、それ以外の記号は用いないでください",
  },
  age: {
    unspecified: "年齢が入力されていません",
    notInt: "年齢が数字で入力してください",
    invalidFormat: "年齢が負の数になっています",
  },
  category: {
    notInt: "categoryは数字で入力してください",
    invalidFormat: "不正なカテゴリーです",
  },
  limit: {
    notInt: "limitは数字で入力してください",
    invalidFormat: "limitは0以上1000以下の値にしてください。",
  },
  offset: {
    notInt: "offsetは数字で入力してください",
    invalidFormat: "offsetは0以上の値にしてください。",
  },
};

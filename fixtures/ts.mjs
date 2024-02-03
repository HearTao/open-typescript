import _ts from "typescript";

const ts = {
  ..._ts,
  isInternalDeclaration: () => false
};

export default ts;

import React, { useState } from "react";
import { Require } from "../../types/types";
import {
  SelectContent,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";

type RequireType = "text" | "amount" | "quantity";

interface AddRequireFormProps {
  onAdd: (require: Require) => void;
  nextId: number;
}

const AddRequireForm: React.FC<AddRequireFormProps> = ({ onAdd, nextId }) => {
  const [question, setQuestion] = useState("");
  const [type, setType] = useState<RequireType>("text");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [quantities, setQuantities] = useState("");

  const handleAdd = () => {
    let type_value;

    if (type === "amount") {
      type_value = {
        min: Number(min),
        max: Number(max),
      };
    }

    if (type === "quantity") {
      const qtyList = quantities
        .split(",")
        .map((q) => q.trim())
        .filter(Boolean)
        .map(Number);

      type_value = {
        options: qtyList,
      };
    }

    const newRequire: Require = {
      id: nextId,
      name: question,
      question,
      type,
      type_value:type_value as {
    min?: number | string;
    max?: number | string;
    options?: number[];
} | null,
      product_id: 0
    };

    onAdd(newRequire);

    // Reset
    setQuestion("");
    setType("text");
    setMin("");
    setMax("");
    setQuantities("");
  };

  return (
    <div className="mb-4 border p-4 rounded">
      <h4 className="mb-2 font-semibold">إضافة حقل جديد</h4>

      <Input
        placeholder="السؤال (مثلاً: أدخل الايدي)"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="input mb-2 w-full"
      />

      <Select value={type} onValueChange={(e) => setType(e as RequireType)}>
        <SelectTrigger>
          <SelectValue placeholder="type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text">نص</SelectItem>
          <SelectItem value="amount">مبلغ</SelectItem>
          <SelectItem value="quantity">كمية</SelectItem>
        </SelectContent>
      </Select>

      {type === "amount" && (
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="الحد الأدنى"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="input w-full"
          />
          <input
            type="number"
            placeholder="الحد الأعلى"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="input w-full"
          />
        </div>
      )}

      {type === "quantity" && (
        <input
          type="text"
          placeholder="الكميات مفصولة بفواصل (مثلاً: 200,300,400)"
          value={quantities}
          onChange={(e) => setQuantities(e.target.value)}
          className="input mb-2 w-full"
        />
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="btn btn-secondary w-full"
      >
        إضافة الحقل
      </button>
    </div>
  );
};

export default AddRequireForm;

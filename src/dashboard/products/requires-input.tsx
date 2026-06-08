import React from "react";
import { Require } from "../../types/types";
import { Button } from "../../components/ui/button";

interface RequireInputProps {
  require: Require;
  value: string | number;
  onDelete: (id: number) => void;
}

export const RequireInput: React.FC<RequireInputProps> = ({
  require,
  value,
  onDelete,
}) => {
  const { id, question, type, type_value } = require;
  const min = type_value?.min;
  const max = type_value?.max;
  const options =
    type === "quantity" && type_value && Array.isArray(type_value.options)
      ? type_value.options
      : undefined;

  const displayValue = () => {
    if (type === "quantity" && Array.isArray(options)) {
      return options.includes(Number(value)) ? `${value}` : "غير معروف";
    }
    return value?.toString() ?? "—";
  };

  return (
    <div className="mb-4 border p-4 rounded relativ">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold mb-1">{question}</p>
          <p className="text-sm mb-1">القيمة المدخلة: {displayValue()}</p>

          {type === "amount" && (min || max) && (
            <p className="text-xs text-gray-500">
              {min && `الحد الأدنى: ${min}`} {min && max && " - "}{" "}
              {max && `الحد الأعلى: ${max}`}
            </p>
          )}

          {type === "quantity" && options?.length && (
            <p className="text-xs text-gray-500">
              الكميات المتاحة: {options.join(", ")}
            </p>
          )}
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(id)}
          className="ml-4"
        >
          حذف
        </Button>
      </div>
    </div>
  );
};

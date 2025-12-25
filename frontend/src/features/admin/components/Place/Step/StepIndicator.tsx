import React from "react";
import { Info, MapPin, Gift, Upload, Box } from "lucide-react";

interface Step {
  number: number;
  label: string;
  icon: "info" | "location" | "gift" | "upload" | "box";
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  steps,
}) => {
  const getIcon = (iconType: string, isActiveOrCompleted: boolean) => {
    const iconClass = isActiveOrCompleted ? "text-white" : "text-gray-400";
    const size = 24;

    switch (iconType) {
      case "info":
        return <Info className={iconClass} size={size} />;
      case "location":
        return <MapPin className={iconClass} size={size} />;
      case "gift":
        return <Gift className={iconClass} size={size} />;
      case "upload":
        return <Upload className={iconClass} size={size} />;
      case "box":
        return <Box className={iconClass} size={size} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="flex items-center justify-between bg-white border border-gray-200 rounded-lg py-4 px-4 md:px-8 mb-6 overflow-x-auto"
      role="navigation"
      aria-label="Progress indicator"
    >
      {steps.map((step, index) => {
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;
        const isActiveOrCompleted = isActive || isCompleted;

        return (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-2 md:gap-4 min-w-fit">
              {/* Icon Circle */}
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                  isActiveOrCompleted ? "bg-blue-600" : "bg-gray-100"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {getIcon(step.icon, isActiveOrCompleted)}
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <span
                  className={`text-xs md:text-sm ${
                    isActiveOrCompleted ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  Bước {step.number}/3
                </span>
                <span
                  className={`text-sm md:text-base font-medium ${
                    isActiveOrCompleted ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>

            {/* Divider */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 mx-4 md:mx-8 border-t-2 transition-colors ${
                  isCompleted ? "border-blue-600" : "border-gray-300"
                }`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;

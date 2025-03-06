"use client";

import { improveWithAI } from "@/actions/resume";
import useFetch from "@/app/hooks/use-fetch";
import { entrySchema } from "@/app/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Loader2, PlusCircle, Sparkles, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const date = parse(dateString, "yyyy-MM", new Date());
  return format(date, "MMM yyyy");
};

const EntryForm = ({ type, entries, onChange }) => {
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit: handleValidation,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    },
  });

  const current = watch("current");

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);
  


  // Modify handleAdd to handle education end dates differently
  const handleAdd = handleValidation((data) => {
    const formattedEntry = {
      ...data,
      startDate: formatDisplayDate(data.startDate),
      endDate: type === 'Education' && data.current ? 
        formatDisplayDate(data.endDate) :  // Keep end date for education
        data.current ? "" : formatDisplayDate(data.endDate),
    };

    onChange([...entries, formattedEntry]);
    reset();
    setIsAdding(false);
  });


  const handleDelete = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
  };

  // Add this effect to handle the improvement result
  useEffect(() => {
    if (improvedContent && !isImproving) {
      setValue("description", improvedContent);
      toast.success("Description improved successfully!");
    }
    if (improveError) {
      toast.error(improveError.message || "Failed to improve description");
    }
  }, [improvedContent, improveError, isImproving, setValue]);

  // Replace handleImproveDescription with this
  const handleImproveDescription = async () => {
    const description = watch("description");
    if (!description) {
      toast.error("Please enter a description first");
      return;
    }

    await improveWithAIFn({
      current: description,
      type: type.toLowerCase(), // 'experience', 'education', or 'project'
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
      {/* // In EntryForm component's entries.map() */}
   {entries.map((item, index) => (
  <Card key={index}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {type === 'Education' ? (
          <>
            {item.title}
            <span className="font-normal">
              {" "}@ {item.organization.split("|")[0]?.trim()}
              {item.organization.split("|")[1] && (
                <span className="text-muted-foreground">
                  {" | "}{item.organization.split("|")[1]?.trim()}
                </span>
              )}
            </span>
          </>
        ) : type === 'Project' ? (
          <a 
            href={item.organization} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {item.title}
          </a>
        ) : (
          `${item.title} @ ${item.organization}`
        )}
      </CardTitle>
      <Button
        variant="outline"
        size="icon"
        type="button"
        onClick={() => handleDelete(index)}
      >
        <X className="h-4 w-4" />
      </Button>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        {type === 'Education' && item.current ? 
          `${item.startDate} - ${item.endDate} (Expected)` :
          item.current ?
          `${item.startDate} - Present` :
          `${item.startDate} - ${item.endDate}`}
      </p>
      <p className="mt-2 text-sm whitespace-pre-wrap">
        {type === 'Project' ? (
          item.description.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line.startsWith('•') ? (
                <span className="block ml-4">{line}</span>
              ) : (
                line
              )}
              <br />
            </React.Fragment>
          ))
        ) : item.description}
      </p>
    </CardContent>
  </Card>
))}
      </div>
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add {type}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder={
                    type === 'Education' ? "Degree (e.g., B.Tech in Computer Science)" :
                    type === 'Project' ? "Project Name" : "Title/Position"
                  }
                  {...register("title")}
                  error={errors.title}
                />
               {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  placeholder={
                    type === 'Education' ? "University & Location (e.g., Jaypee University | Anoopshahr, India)" :
                    type === 'Project' ? "Project URL (e.g., GitHub link)" : "Organization/Company"
                  }
                  {...register("organization")}
                  error={errors.organization}
                />
                  {errors.organization && (
                  <p className="text-sm text-red-500">
                    {errors.organization.message}
                  </p>
                )}
              </div>
            </div>

            {/* Date inputs with education exception */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  type="month"
                  {...register("startDate")}
                  error={errors.startDate}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="month"
                  {...register("endDate")}
                  disabled={current && type !== 'Education'} // Allow education end dates
                  error={errors.endDate}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Current checkbox */}
            <div className="flex items-center space-x-2">
            <input
                type="checkbox"
                id="current"
                {...register("current")}
                onChange={(e) => {
                  setValue("current", e.target.checked);
                  if (e.target.checked) {
                    setValue("endDate", "");
                  }
                }}
              />
              <label htmlFor="current">Current {type}</label>
              
            </div>

            {/* Description with type-specific placeholder */}
            <div className="space-y-2">
              <Textarea
                placeholder={
                  type === 'Education' ? "GPA, honors, and key achievements..." :
                  type === 'Project' ? "Project details, technologies used, and your contributions..." :
                  `Description of your ${type.toLowerCase()}`
                }
                className="h-32"
                {...register("description")}
                error={errors.description}
              />
             {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleImproveDescription}
              disabled={isImproving || !watch("description")}
            >
              {isImproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Improve with AI
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setIsAdding(false);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAdd}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isAdding && (
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setIsAdding(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add {type}
        </Button>
      )}
    </div>
  );
};

export default EntryForm;

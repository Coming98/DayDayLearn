'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Select } from '@/app/components/ui/Select';
import { useCardsStore } from '@/lib/store/cards';
import { useUIStore } from '@/lib/store/ui';
import { cardService } from '@/lib/services/card-service';
import { createDefaultCard } from '@/lib/validation/card-rules';
import { createToast, handleError } from '@/lib/utils/error-handling';

export default function CreateCardPage() {
  const router = useRouter();
  const { addCard, categories, tags } = useCardsStore();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    notes: '',
    categoryId: '',
    selectedTags: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    } else if (formData.question.trim().length < 3) {
      newErrors.question = 'Question must be at least 3 characters';
    }

    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cardData = createDefaultCard(
        formData.question.trim(),
        formData.answer.trim()
      );

      const newCard = await cardService.createCard({
        ...cardData,
        notes: formData.notes.trim() || undefined,
        categoryId: formData.categoryId || undefined,
        tags: formData.selectedTags,
      });

      addCard(newCard);
      addToast(createToast('success', 'Card created successfully!'));
      
      // Navigate to cards list or show another form
      router.push('/');
    } catch (error) {
      const appError = handleError(error);
      setErrors({ submit: appError.userMessage || appError.message });
      addToast(createToast('error', appError.userMessage || 'Failed to create card'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      question: '',
      answer: '',
      notes: '',
      categoryId: '',
      selectedTags: [],
    });
    setErrors({});
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Create New Card
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create a new learning card with question, answer, and optional notes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question */}
        <Input
          label="Question *"
          placeholder="What do you want to remember?"
          value={formData.question}
          onChange={(e) => handleInputChange('question', e.target.value)}
          error={errors.question}
          fullWidth
          required
        />

        {/* Answer */}
        <div>
          <label
            htmlFor="answer"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Answer *
          </label>
          <textarea
            id="answer"
            rows={4}
            placeholder="The answer to your question..."
            value={formData.answer}
            onChange={(e) => handleInputChange('answer', e.target.value)}
            className={`
              block w-full px-3 py-2 
              border rounded-lg 
              text-gray-900 dark:text-gray-100
              bg-white dark:bg-gray-800
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-offset-2
              transition-colors
              ${errors.answer 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }
            `.replace(/\s+/g, ' ').trim()}
            required
          />
          {errors.answer && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.answer}
            </p>
          )}
        </div>

        {/* Notes (Optional) */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Additional notes, examples, or context..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="
              block w-full px-3 py-2 
              border border-gray-300 dark:border-gray-600
              rounded-lg 
              text-gray-900 dark:text-gray-100
              bg-white dark:bg-gray-800
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              transition-colors
            "
          />
        </div>

        {/* Category */}
        {categories.length > 0 && (
          <Select
            label="Category (Optional)"
            options={[
              { value: '', label: 'No category' },
              ...categories.map(cat => ({ value: cat.id, label: cat.name })),
            ]}
            value={formData.categoryId}
            onChange={(e) => handleInputChange('categoryId', e.target.value)}
            fullWidth
          />
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${formData.selectedTags.includes(tag.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.submit}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            fullWidth
          >
            Create Card
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}

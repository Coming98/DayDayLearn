'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Select } from '@/app/components/ui/Select';
import { useCardsStore } from '@/lib/store/cards';
import { useUIStore } from '@/lib/store/ui';
import { cardService } from '@/lib/services/card-service';
import { createToast, handleError } from '@/lib/utils/error-handling';

interface EditCardPageProps {
  params: {
    id: string;
  };
}

export default function EditCardPage({ params }: EditCardPageProps) {
  const router = useRouter();
  const { cards, updateCard, categories, tags } = useCardsStore();
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const card = cards.find(c => c.id === params.id);
    
    if (!card) {
      addToast(createToast('error', 'Card not found'));
      router.push('/');
      return;
    }

    setFormData({
      question: card.question,
      answer: card.answer,
      notes: card.notes || '',
      categoryId: card.categoryId || '',
      selectedTags: card.tags,
    });
    setIsLoading(false);
  }, [params.id, cards, router, addToast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      const updatedCard = await cardService.updateCard(params.id, {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        notes: formData.notes.trim() || undefined,
        categoryId: formData.categoryId || undefined,
        tags: formData.selectedTags,
      });

      updateCard(params.id, updatedCard);
      addToast(createToast('success', 'Card updated successfully!'));
      router.push('/');
    } catch (error) {
      const appError = handleError(error);
      setErrors({ submit: appError.userMessage || appError.message });
      addToast(createToast('error', appError.userMessage || 'Failed to update card'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Edit Card
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update your learning card
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

        {/* Notes */}
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
            Update Card
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

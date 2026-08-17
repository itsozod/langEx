import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';

import { CountryPicker } from '@/screens/onboarding/components/country-picker';
import { OnboardingCard } from '@/screens/onboarding/components/onboarding-card';
import { OnboardingScreen } from '@/screens/onboarding/components/onboarding-screen';
import { countrySchema, type CountryFormValues } from '@/screens/onboarding/schemas';
import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { useOnboardingStore } from '@/shared/store/onboardingStore';

export default function OnboardingStepTwo() {
  const country = useOnboardingStore((state) => state.country);
  const update = useOnboardingStore((state) => state.update);
  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema),
    defaultValues: { country },
  });

  const onBack = () => {
    update({ country: getValues('country') });
    router.back();
  };

  const onNext = ({ country: countryCode }: CountryFormValues) => {
    update({ country: countryCode });
    router.push('/onboarding/step3');
  };

  return (
    <OnboardingScreen
      step={2}
      title="Where are you from?"
      subtitle="Choose your country so partners can learn a little more about you."
      onBack={onBack}>
      <OnboardingCard>
        <Controller
          control={control}
          name="country"
          render={({ field: { onChange, value } }) => (
            <CountryPicker value={value} error={errors.country?.message} onChange={onChange} />
          )}
        />

        <AuthPrimaryButton label="Next" onPress={() => void handleSubmit(onNext)()} />
      </OnboardingCard>
    </OnboardingScreen>
  );
}

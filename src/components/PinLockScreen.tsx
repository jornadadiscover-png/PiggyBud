import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Delete, Eye, EyeOff } from 'lucide-react';
import piggyLogo from '@/assets/piggy-bud-logo.webp';

interface PinLockScreenProps {
  mode: 'verify' | 'setup';
  onSuccess: () => void;
}

export function PinLockScreen({ mode, onSuccess }: PinLockScreenProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const { verifyPin, setPin: savePin } = useSettingsStore();

  const handleNumberClick = (num: string) => {
    const currentPin = step === 'confirm' ? confirmPin : pin;
    if (currentPin.length < 6) {
      if (step === 'confirm') {
        setConfirmPin(currentPin + num);
      } else {
        setPin(currentPin + num);
      }
      setError('');
    }
  };

  const handleDelete = () => {
    if (step === 'confirm') {
      setConfirmPin(confirmPin.slice(0, -1));
    } else {
      setPin(pin.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    if (mode === 'verify') {
      if (await verifyPin(pin)) {
        onSuccess();
      } else {
        setError('PIN incorreto! Tente novamente.');
        setPin('');
      }
    } else {
      if (step === 'enter') {
        if (pin.length < 4) {
          setError('O PIN deve ter pelo menos 4 dígitos');
          return;
        }
        setStep('confirm');
      } else {
        if (pin === confirmPin) {
          await savePin(pin);
          onSuccess();
        } else {
          setError('Os PINs não coincidem. Tente novamente.');
          setPin('');
          setConfirmPin('');
          setStep('enter');
        }
      }
    }
  };

  const currentPin = step === 'confirm' ? confirmPin : pin;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background safe-top safe-bottom">
      {/* Header with Piggy Bud logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow p-1">
          <img src={piggyLogo} alt="Piggy Bud" className="w-full h-full rounded-2xl object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {mode === 'setup' 
            ? (step === 'enter' ? 'Crie seu PIN' : 'Confirme seu PIN')
            : 'Digite seu PIN'
          }
        </h1>
        <p className="text-muted-foreground mt-2 text-center px-8">
          {mode === 'setup'
            ? 'Use 4-6 dígitos para proteger seus dados'
            : 'Entre com seu PIN para continuar'
          }
        </p>
      </div>

      {/* PIN Display */}
      <div className="flex gap-3 mb-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              i < currentPin.length
                ? 'bg-primary scale-110'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Show/Hide PIN Toggle */}
      <button
        onClick={() => setShowPin(!showPin)}
        className="flex items-center gap-2 text-muted-foreground mb-4 text-sm"
      >
        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        {showPin ? currentPin || '------' : 'Mostrar PIN'}
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-destructive text-sm mb-4 animate-shake">{error}</p>
      )}

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="outline"
            className="w-16 h-16 text-2xl font-semibold rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            onClick={() => handleNumberClick(num.toString())}
          >
            {num}
          </Button>
        ))}
        <div />
        <Button
          variant="outline"
          className="w-16 h-16 text-2xl font-semibold rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          onClick={() => handleNumberClick('0')}
        >
          0
        </Button>
        <Button
          variant="ghost"
          className="w-16 h-16 rounded-2xl"
          onClick={handleDelete}
        >
          <Delete className="w-6 h-6" />
        </Button>
      </div>

      {/* Submit Button */}
      {currentPin.length >= 4 && (
        <Button
          className="w-48 h-12 text-lg gradient-primary text-primary-foreground rounded-2xl animate-scale-in"
          onClick={handleSubmit}
        >
          {mode === 'setup' && step === 'enter' ? 'Próximo' : 'Confirmar'}
        </Button>
      )}
    </div>
  );
}

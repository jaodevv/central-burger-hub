import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface StoreSettings {
  id: string;
  name: string;
  whatsapp: string;
  delivery_fee: number;
  is_open: boolean;
  opening_hours: string;
}

interface SettingsFormProps {
  storeSettings: StoreSettings | null | undefined;
  isAdmin: boolean;
  onSave: (settings: Partial<StoreSettings>) => void;
  isPending: boolean;
}

export function SettingsForm({ storeSettings, isAdmin, onSave, isPending }: SettingsFormProps) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [openingHours, setOpeningHours] = useState("");

  useEffect(() => {
    if (storeSettings) {
      setName(storeSettings.name || "");
      setWhatsapp(storeSettings.whatsapp || "");
      setDeliveryFee(storeSettings.delivery_fee?.toString() || "");
      setOpeningHours(storeSettings.opening_hours || "");
    }
  }, [storeSettings]);

  const handleSave = () => {
    onSave({
      name,
      whatsapp,
      delivery_fee: parseFloat(deliveryFee) || 0,
      opening_hours: openingHours,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="font-display text-xl tracking-wide">Configurações</h2>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Loja</CardTitle>
          <CardDescription>
            Configure as informações gerais do seu estabelecimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Nome da Loja</Label>
            <Input
              id="store-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isAdmin}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="5511999999999"
              disabled={!isAdmin}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-fee">Taxa de Entrega</Label>
            <Input
              id="delivery-fee"
              type="number"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              disabled={!isAdmin}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours">Horário de Funcionamento</Label>
            <Input
              id="hours"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              disabled={!isAdmin}
            />
          </div>
          <Button 
            className="w-full" 
            disabled={!isAdmin || isPending}
            onClick={handleSave}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

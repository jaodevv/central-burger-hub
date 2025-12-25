import React from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderProps {
  order: {
    id: string;
    customer_name: string;
    items: OrderItem[];
    total: number;
    created_at: string;
    payment_method?: string;
    delivery_fee?: number;
  };
}

export const ThermalTicket = ({ order }: OrderProps) => {
  return (
    <div id="printable-ticket" className="hidden print:block w-[80mm] p-4 text-black bg-white">
      {/* HEADER COM LOGO SVG (PRETO PURO) */}
      <div className="text-center border-b-2 border-black pb-3 mb-3">
        <svg 
          viewBox="0 0 100 100" 
          className="w-16 h-16 mx-auto mb-1" 
          fill="black"
        >
          {/* Exemplo de Ícone Minimalista DashMenu (D estilizado) */}
          <path d="M20 10h30c20 0 35 15 35 35s-15 35-35 35H20V10zm10 10v50h20c15 0 25-10 25-25s-10-25-25-25H30z" />
          <rect x="35" y="35" width="10" height="10" />
        </svg>
        <h1 className="text-2xl font-black uppercase tracking-tighter">DASHMENU</h1>
        <p className="text-[10px] font-bold">CENTRAL BURGER HUB</p>
        <p className="text-[9px] uppercase tracking-widest">Premium Delivery</p>
      </div>

      {/* INFO DO PEDIDO */}
      <div className="text-[12px] leading-tight mb-3">
        <p className="flex justify-between">
          <span>PEDIDO: <strong>#{order.id.slice(0, 8).toUpperCase()}</strong></span>
        </p>
        <p>DATA: {new Date(order.created_at).toLocaleString('pt-BR')}</p>
        <p className="border-t border-black mt-1 pt-1">
          <strong>CLIENTE:</strong> {order.customer_name.toUpperCase()}
        </p>
      </div>

      {/* TABELA DE ITENS */}
      <table className="w-full text-[12px] mb-3">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="py-1">QTD</th>
            <th className="py-1">ITEM</th>
            <th className="py-1 text-right">TOTAL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-gray-400">
          {order.items.map((item, i) => (
            <tr key={i} className="align-top">
              <td className="py-2 font-bold">{item.quantity}x</td>
              <td className="py-2 px-1 leading-tight">
                <span className="uppercase">{item.name}</span>
              </td>
              <td className="py-2 text-right whitespace-nowrap">
                R$ {(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAIS */}
      <div className="border-t-2 border-black pt-2 text-[13px]">
        {order.delivery_fee !== undefined && (
          <div className="flex justify-between">
            <span>TAXA ENTREGA:</span>
            <span>R$ {order.delivery_fee.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-black mt-1">
          <span>TOTAL:</span>
          <span>R$ {order.total.toFixed(2)}</span>
        </div>
        {order.payment_method && (
          <p className="text-[11px] mt-1 italic">PAGAMENTO: {order.payment_method.toUpperCase()}</p>
        )}
      </div>

      {/* FOOTER / QR CODE PLACEHOLDER */}
      <div className="text-center mt-6 pt-4 border-t border-dashed border-black">
        <div className="w-24 h-24 border border-black mx-auto mb-2 flex items-center justify-center">
           <span className="text-[8px] uppercase">QR Code Pedido</span>
        </div>
        <p className="text-[10px] font-bold">www.dashmenu.com.br</p>
        <p className="text-[9px]">Obrigado por escolher a excelência!</p>
      </div>
    </div>
  );
};

import type { OrderItemRecord } from "@/dal";

interface OrderItemsListProps {
  items: OrderItemRecord[];
  currency: "CDF" | "USD";
}

export function OrderItemsList({ items, currency }: OrderItemsListProps) {
  return (
    <div className="rounded-xl border border-[#EAECF0] bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#EAECF0] flex items-center justify-between">
        <h3 className="font-semibold text-[#101828]">Articles commandés ({items.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#475467]">
          <thead className="bg-[#F8F9FA] border-b border-[#EAECF0] text-xs uppercase font-medium text-[#475467]">
            <tr>
              <th className="py-3 px-4">Article & Service</th>
              <th className="py-3 px-4">Tissu</th>
              <th className="py-3 px-4 text-center">Déclaré</th>
              <th className="py-3 px-4 text-center">Collecté</th>
              <th className="py-3 px-4 text-center">Reçu</th>
              <th className="py-3 px-4 text-right">Prix unit.</th>
              <th className="py-3 px-4">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECF0]">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-[#667085]">
                  Aucun article trouvé.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8F9FA]/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#101828]">
                      {item.itemNameFr || item.customLabel || "Article personnalisé"}
                    </p>
                    <p className="text-xs text-[#667085]">{item.serviceNameFr || "Service standard"}</p>
                    {item.conditionNote && (
                      <p className="text-xs text-[#B54708] mt-0.5">⚠️ Note: {item.conditionNote}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#344054]">
                    {item.fabricNameFr || "Standard"}
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-[#101828]">
                    {item.declaredQuantity}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-[#344054]">
                    {item.pickupQuantity !== null ? item.pickupQuantity : "—"}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-[#344054]">
                    {item.receivedQuantity !== null ? item.receivedQuantity : "—"}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-[#101828]">
                    {item.unitPrice.toLocaleString()} {currency}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        item.status === "accepted"
                          ? "bg-[#ECFDF3] text-[#027A48]"
                          : "bg-[#FEF3F2] text-[#B42318]"
                      }`}
                    >
                      {item.status === "accepted" ? "Accepté" : "Retourné"}
                    </span>
                    {item.isFlagged && (
                      <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FEF0C7] text-[#B54708]">
                        Signalé
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

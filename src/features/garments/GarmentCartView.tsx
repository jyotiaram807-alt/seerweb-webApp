import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Minus, Package, Plus, Printer, ShoppingBag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiUrl } from "@/url";
import { getImageUrl } from "@/lib/imageUrl";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <rect width="240" height="240" rx="24" fill="#f8fafc" />
      <rect x="20" y="20" width="200" height="200" rx="24" fill="#ffffff" stroke="#e2e8f0" />
      <path d="M78 154h84" stroke="#94a3b8" stroke-width="10" stroke-linecap="round" />
      <path d="M92 106c0-16 13-29 28-29s28 13 28 29" stroke="#cbd5e1" stroke-width="12" stroke-linecap="round" fill="none" />
      <circle cx="120" cy="112" r="16" fill="#e2e8f0" />
    </svg>
  `);

function formatCurrency(value: number) {
  return `Rs.${value.toLocaleString("en-IN")}`;
}

export function GarmentCartView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, updateVariantQty, removeVariant, removeFromCart, clearCart, cartTotal } = useCart();
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [retailers, setRetailers] = useState<Array<{ id: number; name: string; store_name?: string }>>([]);
  const [selectedRetailerId, setSelectedRetailerId] = useState("");

  const needsRetailerSelection = user?.role === "dealer" || user?.role === "staff";

  useEffect(() => {
    if (!needsRetailerSelection || !user?.id) return;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const dealerId = user.role === "dealer" ? user.id : user.dealer_id;
        const endpoint =
          user.role === "staff"
            ? `${apiUrl}/staff/get_retailers_by_executive?executiveid=${user.id}`
            : `${apiUrl}/retailers?dealerid=${dealerId}`;
        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setRetailers(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Could not load retailers for garments booking");
      }
    })();
  }, [needsRetailerSelection, user]);

  const summary = useMemo(() => {
    const totalPieces = cart.items.reduce(
      (sum, item) => sum + item.variants.reduce((variantSum, variant) => variantSum + variant.quantity, 0),
      0
    );

    const totalSets = cart.items.reduce(
      (sum, item) => sum + item.variants.reduce((variantSum, variant) => variantSum + (variant.setQuantity ?? 0), 0),
      0
    );

    const gst = cartTotal * 0.05;

    return {
      totalPieces,
      totalSets,
      gst,
      finalAmount: cartTotal + gst,
      productCount: cart.items.length,
    };
  }, [cart.items, cartTotal]);

  const submitOrder = async () => {
    if (!user || cart.items.length === 0) return;
    if (needsRetailerSelection && !selectedRetailerId) {
      toast.error("Select a retailer before submitting this booking");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const selectedRetailer = retailers.find((retailer) => String(retailer.id) === selectedRetailerId);
      const orderItems = cart.items.flatMap((item) =>
        item.variants.map((variant) => ({
          productId: item.productId,
          variantId: variant.variantId,
          size: variant.size,
          color: variant.color,
          quantity: variant.quantity,
          price: variant.price,
          subtotal: variant.price * variant.quantity,
          rack: variant.rack || "",
          attributes_snapshot: {
            ...item.attributes,
            brand: item.brand,
            model: item.model || "",
            business_type_id: item.businessTypeId,
            garment_meta: item.garmentMeta,
            set_quantity: variant.setQuantity ?? 0,
          },
        }))
      );

      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          retailerId: user?.role === "retailer" ? user.id : selectedRetailer?.id,
          retailerName: user?.role === "retailer" ? user?.name : selectedRetailer?.name,
          dealerId: user?.dealer_id ?? user?.id,
          total: summary.finalAmount,
          notes,
          order_by: user?.role,
          order_by_id: user?.id,
          items: orderItems,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit garments order");
      }

      toast.success("Garments order submitted");
      clearCart();
      navigate(user?.role === "retailer" ? "/retailer/orders" : "/dealer/orders");
    } catch (error: any) {
      toast.error(error?.message || "Could not submit garments order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Shopping Cart</h1>
              <p className="mt-1 text-sm text-slate-500">
                Review product details, update size quantities, and confirm the garment booking summary.
              </p>
            </div>
            <div className="text-sm text-slate-500">Price</div>
          </div>
        </div>

        {cart.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Package className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Your garments cart is empty</h2>
            <p className="mt-1 text-sm text-slate-500">Add products and size lines to start building a booking.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {cart.items.map((item) => {
              const imageSrc = item.garmentMeta?.galleryImages?.[0] || getImageUrl(item.image) || FALLBACK_IMAGE;
              const itemPieces = item.variants.reduce((sum, variant) => sum + variant.quantity, 0);
              const itemTotal = item.variants.reduce((sum, variant) => sum + variant.price * variant.quantity, 0);

              return (
                <article key={item.productId} className="px-6 py-6">
                  <div className="grid gap-6 lg:grid-cols-[132px_minmax(0,1fr)_180px]">
                    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
                      <img
                        src={imageSrc}
                        alt={item.productName}
                        onError={(event) => {
                          event.currentTarget.src = FALLBACK_IMAGE;
                        }}
                        className="h-[170px] w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                        {item.garmentMeta?.designNumber || "Design"}
                      </div>
                      <h2 className="mt-1 text-[28px] font-bold leading-tight text-slate-900">{item.productName}</h2>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.brand ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {item.brand}
                          </span>
                        ) : null}
                        {item.garmentMeta?.fabricType ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {item.garmentMeta.fabricType}
                          </span>
                        ) : null}
                        {item.garmentMeta?.selectedColor ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {item.garmentMeta.selectedColor}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 text-sm text-slate-600">
                        {itemPieces} piece{itemPieces !== 1 ? "s" : ""} across {item.variants.length} size
                        {item.variants.length !== 1 ? "s" : ""}.
                      </p>

                      <div className="mt-5 space-y-3">
                        {item.variants.map((variant) => {
                          const lineTotal = variant.price * variant.quantity;

                          return (
                            <div
                              key={`${item.productId}-${variant.variantId}-${variant.size}-${variant.color}`}
                              className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="space-y-4">
                                {/* Row 1 : Size & Rate */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1 text-white">
                                    <span className="text-sm font-medium">Size:</span>
                                    <span className="text-xs">
                                      {variant.size || "Single"}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between min-w-[80px]">
                                    <span className="text-sm text-slate-600">Rate:</span>
                                    <span className="text-sm font-bold text-slate-900">
                                      {formatCurrency(variant.price)}
                                    </span>
                                  </div>
                                </div>

                                {/* Row 2 : Quantity & Delete */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center overflow-hidden rounded-full border-2 border-[#566de2] bg-white">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        variant.quantity <= 1
                                          ? removeVariant(item.productId, variant.variantId)
                                          : updateVariantQty(
                                              item.productId,
                                              variant.variantId,
                                              variant.quantity - 1
                                            )
                                      }
                                      className="flex h-8 w-8 items-center justify-center text-slate-700 transition hover:bg-amber-50"
                                    >
                                      <Minus size={18} />
                                    </button>

                                    <span className="min-w-[70px] text-center text-xl font-semibold text-slate-900">
                                      {variant.quantity}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateVariantQty(
                                          item.productId,
                                          variant.variantId,
                                          variant.quantity + 1
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center text-slate-700 transition hover:bg-amber-50"
                                    >
                                      <Plus size={18} />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeVariant(item.productId, variant.variantId)
                                    }
                                    className="text-base font-medium text-slate-500 transition hover:text-red-600"
                                  >
                                    Delete size
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="inline-flex items-center gap-2 text-red-600 transition hover:text-red-700"
                        >
                          <Trash2 size={15} />
                          Delete product
                        </button>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500">
                          {item.garmentMeta?.bookingType || "Piece order"} booking
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500">Ready to submit</span>
                      </div>
                    </div>

                    <div className="text-left lg:text-right">
                      <div className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-600">Rate</div>
                      <div className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(itemTotal)}</div>
                      <div className="mt-2 text-sm text-slate-500">
                        {itemPieces} piece{itemPieces !== 1 ? "s" : ""} total
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
         
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Subtotal ({summary.totalPieces} items): {formatCurrency(cartTotal)}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              GST added at checkout summary. Final payable amount:{" "}
              <span className="font-semibold text-slate-900">{formatCurrency(summary.finalAmount)}</span>
            </p>
          </div>

          {needsRetailerSelection ? (
            <select
              value={selectedRetailerId}
              onChange={(event) => setSelectedRetailerId(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-amber-400 focus:outline-none"
            >
              <option value="">Select Retailer</option>
              {retailers.map((retailer) => (
                <option key={retailer.id} value={retailer.id}>
                  {retailer.store_name || retailer.name}
                </option>
              ))}
            </select>
          ) : null}

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Products</span>
              <span className="font-semibold text-slate-900">{summary.productCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total Pieces</span>
              <span className="font-semibold text-slate-900">{summary.totalPieces}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total Sets</span>
              <span className="font-semibold text-slate-900">{summary.totalSets}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Dealer Rate Total</span>
              <span className="font-semibold text-slate-900">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">GST</span>
              <span className="font-semibold text-slate-900">{formatCurrency(summary.gst)}</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={submitOrder}
            disabled={submitting || cart.items.length === 0}
            className="h-12 w-full rounded-full bg-[#5d78ff] text-base font-semibold text-[white] hover:bg-[#5d78ff]/90 focus-visible:outline-[#5d78ff]/50 disabled:pointer-events-none disabled:bg-slate-200 disabled:text-slate-500"
          >
            <ShoppingBag size={16} className="mr-2" />
            {submitting ? "Submitting..." : "Proceed to Booking"}
          </Button>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 text-base font-semibold text-slate-900">Booking Notes</div>
            <Textarea
              rows={5}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notes for packing, dispatch, assortments, or booking instructions"
              className="rounded-2xl border-slate-200 bg-slate-50"
            />
          </div>

          <div className="space-y-3">
            <Button type="button" variant="outline" className="h-12 w-full rounded-2xl" onClick={() => window.print()}>
              <Printer size={15} className="mr-2" />
              Print Invoice
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-2xl"
              onClick={() => {
                const text = encodeURIComponent(`Garments booking total: ${formatCurrency(summary.finalAmount)}`);
                window.open(`https://wa.me/?text=${text}`, "_blank");
              }}
            >
              <MessageCircle size={15} className="mr-2" />
              Share Via WhatsApp
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Customer } from '../../types';
import { useSpaData } from '../../context/SpaDataContext';
import { Search, User, Phone, X, Check, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { formatVND } from '../../domain/financial';

interface CustomerSearchSelectProps {
  selectedCustomerId: string;
  onSelectCustomer: (customer: Customer) => void;
  onOpenQuickAdd?: () => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

// Helper to remove Vietnamese diacritics for flexible fuzzy searching
function removeVietnameseDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export const CustomerSearchSelect: React.FC<CustomerSearchSelectProps> = ({
  selectedCustomerId,
  onSelectCustomer,
  onOpenQuickAdd,
  placeholder = 'Nhập tên hoặc số điện thoại khách hàng...',
  label = 'Khách hàng',
  required = true,
  className = '',
}) => {
  const { customers, cards } = useSpaData();

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter customers by name or phone
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) {
      return customers.slice(0, 8); // show top 8 customers when empty
    }
    const cleanSearch = removeVietnameseDiacritics(searchTerm.trim());
    const digitsOnly = searchTerm.replace(/\D/g, '');

    return customers.filter((c) => {
      // 1. Search by name (case-insensitive & accent-insensitive)
      const cleanName = removeVietnameseDiacritics(c.fullName);
      if (cleanName.includes(cleanSearch)) return true;

      // 2. Search by phone digits
      if (digitsOnly.length > 0) {
        const cleanPhone = c.phone.replace(/\D/g, '');
        if (cleanPhone.includes(digitsOnly)) return true;
      }

      return false;
    });
  }, [customers, searchTerm]);

  const handleSelect = (customer: Customer) => {
    onSelectCustomer(customer);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < filteredCustomers.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredCustomers.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCustomers[highlightedIndex]) {
        handleSelect(filteredCustomers[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Field Label & Quick Add */}
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
          <User className="w-3.5 h-3.5 text-rose-600" />
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>

        {onOpenQuickAdd && (
          <button
            type="button"
            onClick={onOpenQuickAdd}
            className="text-[10px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            title="Mở popup thêm nhanh khách hàng mới"
          >
            <UserPlus className="w-3 h-3" />
            <span>+ Thêm nhanh</span>
          </button>
        )}
      </div>

      {/* Selected Customer View or Search Input */}
      {selectedCustomer && !isOpen ? (
        <div
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {selectedCustomer.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900 truncate">
                  {selectedCustomer.fullName}
                </span>
                <span className="text-[11px] font-mono text-rose-700 font-semibold shrink-0">
                  {selectedCustomer.phone}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-2 truncate">
                <span>Chi tiêu: {formatVND(selectedCustomer.totalSpend)}</span>
                {selectedCustomer.debtBalance > 0 && (
                  <span className="text-rose-600 font-bold">
                    • Nợ: {formatVND(selectedCustomer.debtBalance)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
            title="Đổi hoặc tìm khách hàng khác"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs font-medium shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden max-h-64 flex flex-col animate-in fade-in duration-150">
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between shrink-0">
            <span>
              {searchTerm.trim() ? `Gợi ý tìm kiếm (${filteredCustomers.length})` : 'Danh sách khách hàng gần đây'}
            </span>
            <span className="text-[9px] text-slate-400 font-normal">Gõ tên hoặc vài số ĐT</span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {filteredCustomers.length === 0 ? (
              <div className="p-4 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                <p className="text-xs text-slate-600">
                  Không tìm thấy khách hàng nào khớp với "<strong>{searchTerm}</strong>"
                </p>
                {onOpenQuickAdd && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenQuickAdd();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Thêm nhanh khách hàng này</span>
                  </button>
                )}
              </div>
            ) : (
              filteredCustomers.map((c, index) => {
                const isSelected = selectedCustomer?.id === c.id;
                const isHighlighted = index === highlightedIndex;

                // Check active treatment cards for customer
                const customerCards = cards.filter(
                  (card) => card.customerId === c.id && card.status === 'active' && card.remainingSessions > 0
                );
                const totalSessions = customerCards.reduce((acc, card) => acc + card.remainingSessions, 0);

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`p-2.5 px-3 cursor-pointer flex items-center justify-between transition-colors ${
                      isHighlighted || isSelected ? 'bg-rose-50/70 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {c.fullName.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">{c.fullName}</span>
                          <span className="font-mono text-[11px] text-rose-700 font-semibold shrink-0">
                            {c.phone}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                          <span>Chi tiêu: {formatVND(c.totalSpend)}</span>
                          {c.debtBalance > 0 && (
                            <span className="text-rose-600 font-bold">
                              • Nợ: {formatVND(c.debtBalance)}
                            </span>
                          )}
                          {totalSessions > 0 && (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                              Thẻ: {totalSessions} buổi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSelected && <Check className="w-4 h-4 text-rose-600" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};


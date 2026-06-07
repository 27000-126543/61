import { ArrowLeft, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { EventItem, SeatZone, Seat } from '@/types';
import { formatCurrency, cn } from '@/utils';

interface Props {
  event: EventItem;
  zone: SeatZone;
  selectedSeats: Seat[];
  onSelectSeat: (seat: Seat) => void;
  onBack: () => void;
  onShowView: () => void;
}

export default function SeatMap({ event, zone, selectedSeats, onSelectSeat, onBack, onShowView }: Props) {
  const zoneSeats = event.seats.filter((s) => s.zoneId === zone.id);
  const rows = [...new Set(zoneSeats.map((s) => s.row))].sort();
  const [scale, setScale] = useState(1);

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.find((s) => s.id === seat.id)) return 'bg-primary-500 text-white ring-2 ring-primary-300';
    if (seat.status === 'sold') return 'bg-gray-300 text-gray-400 cursor-not-allowed';
    if (seat.status === 'reserved') return 'bg-amber-200 text-amber-700 cursor-not-allowed';
    if (seat.status === 'checked_in') return 'bg-green-300 text-green-700 cursor-not-allowed';
    return 'bg-white border border-gray-200 hover:border-primary-500 hover:bg-primary-50 cursor-pointer';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{zone.name}选座</h1>
            <p className="text-sm text-gray-500">{event.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScale(Math.max(0.5, scale - 0.1))} className="p-2 hover:bg-gray-100 rounded-xl">
            <ZoomOut size={20} />
          </button>
          <span className="text-sm text-gray-600 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(Math.min(2, scale + 0.1))} className="p-2 hover:bg-gray-100 rounded-xl">
            <ZoomIn size={20} />
          </button>
          <button onClick={onShowView} className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-xl text-sm">
            <Eye size={18} /> 视角预览
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6">
        <div className="w-full h-12 rounded-full bg-gradient-to-b from-gray-900 to-gray-700 flex items-center justify-center text-white text-sm mb-8 mx-auto" style={{ width: '60%' }}>
          舞台 / 比赛场地
        </div>

        <div className="overflow-auto" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
          <div className="flex flex-col items-center gap-2 py-4">
            {rows.map((row) => (
              <div key={row} className="flex items-center gap-1.5">
                <span className="w-10 text-xs text-gray-400 text-right pr-2">{row}排</span>
                <div className="flex gap-1.5">
                  {zoneSeats
                    .filter((s) => s.row === row)
                    .sort((a, b) => a.number - b.number)
                    .map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => onSelectSeat(seat)}
                        disabled={seat.status !== 'available'}
                        className={cn(
                          'w-6 h-6 text-[10px] rounded-md flex items-center justify-center transition',
                          getSeatColor(seat)
                        )}
                        title={`${seat.row}排${seat.number}座 - ${formatCurrency(seat.price)}`}
                      >
                        {seat.number}
                      </button>
                    ))}
                </div>
                <span className="w-10 text-xs text-gray-400 pl-2">{row}排</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-white border border-gray-200 rounded" />
            <span className="text-sm text-gray-600">可选</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-primary-500 rounded" />
            <span className="text-sm text-gray-600">已选</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-gray-300 rounded" />
            <span className="text-sm text-gray-600">已售</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-amber-200 rounded" />
            <span className="text-sm text-gray-600">锁定</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-green-300 rounded" />
            <span className="text-sm text-gray-600">已入场</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">已选 {selectedSeats.length} 张 · </span>
            <span className="text-xl font-bold text-primary-600">
              {formatCurrency(selectedSeats.reduce((sum, s) => sum + s.price, 0))}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="px-6 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
              返回
            </button>
            <button className="px-8 py-2.5 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-medium rounded-xl hover:shadow-lg transition">
              确认选座
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

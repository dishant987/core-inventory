import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../services/api';
import {
  Plus, X, PlusCircle, MinusCircle, Check, List, LayoutGrid,
  Package, ArrowRight, AlertTriangle, Clock, CheckCircle2, XCircle,
  FileText, ShoppingCart, Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Operations.css';

const COLUMNS = [
  { id: 'Draft',    label: 'Draft',    icon: FileText,      color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.25)' },
  { id: 'Waiting',  label: 'Waiting',  icon: Clock,         color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
  { id: 'Ready',    label: 'Ready',    icon: AlertTriangle, color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)' },
  { id: 'Done',     label: 'Done',     icon: CheckCircle2,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)' },
  { id: 'Canceled', label: 'Canceled', icon: XCircle,       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)' },
];

const TYPE_BADGE = {
  Receipt:             { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  Delivery:            { color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  'Internal Transfer': { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  Adjustment:          { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
};

const ALLOWED_TRANSITIONS = {
  Draft:    ['Waiting', 'Canceled'],
  Waiting:  ['Ready', 'Draft', 'Canceled'],
  Ready:    ['Waiting', 'Done', 'Canceled'],
  Done:     [],
  Canceled: [],
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Operations = () => {
  const [allOperations, setAllOperations]   = useState([]);
  const [locations, setLocations]           = useState([]);
  const [products, setProducts]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [view, setView]                     = useState('kanban');

  // Filters
  const [typeFilter, setTypeFilter]         = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Modal
  const [modalOpen, setModalOpen]           = useState(false);
  const [viewingOp, setViewingOp]           = useState(null);
  const [formData, setFormData]             = useState({
    type: 'Receipt', sourceLocation: '', destinationLocation: '', items: [], notes: '',
  });

  // ─── Data fetching ─────────────────────────────────────────────────────────
  const fetchDependencies = async () => {
    try {
      const [locRes, prodRes] = await Promise.all([
        api.get('/locations?status=active'),
        api.get('/products?status=active&limit=1000'),
      ]);
      setLocations(locRes.data);
      setProducts(prodRes.data.data);
    } catch {
      toast.error('Failed to load locations/products');
    }
  };

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: 500 });
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (locationFilter !== 'all') params.set('location', locationFilter);
      const { data } = await api.get(`/operations?${params}`);
      setAllOperations(data.data || []);
    } catch {
      toast.error('Failed to load operations');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, locationFilter]);

  useEffect(() => { fetchDependencies(); }, []);
  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Kanban data ────────────────────────────────────────────────────────────
  const columns = COLUMNS.map(col => ({
    ...col,
    ops: allOperations.filter(op => op.status === col.id),
  }));

  // ─── Drag & Drop ────────────────────────────────────────────────────────────
  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    const fromStatus = source.droppableId;
    const toStatus   = destination.droppableId;
    if (fromStatus === toStatus) return;

    if (!ALLOWED_TRANSITIONS[fromStatus].includes(toStatus)) {
      toast.error(`Cannot move from ${fromStatus} → ${toStatus}`);
      return;
    }

    setAllOperations(prev =>
      prev.map(op => op._id === draggableId ? { ...op, status: toStatus } : op)
    );

    try {
      if (toStatus === 'Done') {
        if (!window.confirm('Validate this operation? This will permanently commit stock changes.')) {
          setAllOperations(prev =>
            prev.map(op => op._id === draggableId ? { ...op, status: fromStatus } : op)
          );
          return;
        }
        await api.post(`/operations/${draggableId}/validate`);
        toast.success('Operation validated & stock committed!');
      } else {
        await api.put(`/operations/${draggableId}`, { status: toStatus });
        toast.success(`Moved to ${toStatus}`);
      }
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
      fetchAll();
    }
  };

  // ─── Modal helpers ──────────────────────────────────────────────────────────
  const openModal = (op = null) => {
    if (op) {
      setViewingOp(op);
      setFormData({
        type: op.type,
        sourceLocation: op.sourceLocation?._id || '',
        destinationLocation: op.destinationLocation?._id || '',
        items: op.items.map(i => ({ product: i.product._id, quantity: i.quantity })),
        notes: op.notes || '',
      });
    } else {
      setViewingOp(null);
      setFormData({ type: 'Receipt', sourceLocation: '', destinationLocation: '', items: [{ product: '', quantity: 1 }], notes: '' });
    }
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setViewingOp(null); };

  const addItemRow    = () => setFormData(f => ({ ...f, items: [...f.items, { product: '', quantity: 1 }] }));
  const removeItemRow = i  => setFormData(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const handleItemChange = (i, field, val) =>
    setFormData(f => { const items = [...f.items]; items[i][field] = val; return { ...f, items }; });

  const isReadOnly = viewingOp && (viewingOp.status === 'Done' || viewingOp.status === 'Canceled');

  const handleSave = async (e) => {
    e.preventDefault();
    const validItems = formData.items.filter(i => i.product && i.quantity > 0);
    if (!validItems.length) { toast.error('Add at least one valid item.'); return; }

    try {
      const payload = { ...formData, items: validItems };
      if (!payload.sourceLocation) delete payload.sourceLocation;
      if (!payload.destinationLocation) delete payload.destinationLocation;
      if (viewingOp) {
        await api.put(`/operations/${viewingOp._id}`, payload);
        toast.success('Operation updated!');
      } else {
        await api.post('/operations', payload);
        toast.success('Operation drafted!');
      }
      fetchAll();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleStatusChange = async (op, newStatus) => {
    try {
      if (newStatus === 'Done') {
        if (!window.confirm('Validate? This will permanently commit stock.')) return;
        await api.post(`/operations/${op._id}/validate`);
        toast.success('Stock committed!');
      } else {
        await api.put(`/operations/${op._id}`, { status: newStatus });
        toast.success(`Moved to ${newStatus}`);
      }
      fetchAll();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="ops-page">

      {/* ── Header ── */}
      <div className="ops-header">
        <div>
          <h2 className="ops-title">Inventory Operations</h2>
          <p className="ops-subtitle">Transfer, adjust, receive and deliver goods</p>
        </div>

        <div className="ops-actions">
          <select className="ops-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="Receipt">Receipts</option>
            <option value="Delivery">Deliveries</option>
            <option value="Internal Transfer">Transfers</option>
            <option value="Adjustment">Adjustments</option>
          </select>

          <select className="ops-select" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
            <option value="all">All Locations</option>
            {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>

          {/* View Toggle */}
          <div className="view-toggle">
            <button className={`view-btn ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')} title="Kanban view">
              <LayoutGrid size={15} />
            </button>
            <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} title="List view">
              <List size={15} />
            </button>
          </div>

          <button className="btn-primary" onClick={() => openModal()}>
            <Plus size={16} /> New Operation
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="ops-loading">
          <div className="ops-spinner" />
          <span>Loading operations…</span>
        </div>
      ) : view === 'kanban' ? (

        // ─── Kanban Board ────────────────────────────────────────────────────
        <div className="kanban-wrapper">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-board">
              {columns.map(col => {
                const ColIcon = col.icon;
                return (
                  <div
                    key={col.id}
                    className="kanban-col"
                    style={{ '--col-color': col.color, '--col-bg': col.bg, '--col-border': col.border }}
                  >
                    <div className="kanban-col-header">
                      <div className="kanban-col-title">
                        <ColIcon size={15} style={{ color: col.color }} />
                        <span style={{ color: col.color }}>{col.label}</span>
                      </div>
                      <span className="kanban-badge" style={{ background: col.bg, color: col.color }}>
                        {col.ops.length}
                      </span>
                    </div>

                    <Droppable droppableId={col.id} isDropDisabled={col.id === 'Done' || col.id === 'Canceled'}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`kanban-cards ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        >
                          {col.ops.length === 0 && (
                            <div className="kanban-empty">No operations</div>
                          )}

                          {col.ops.map((op, index) => {
                            const typeBadge = TYPE_BADGE[op.type] || {};
                            return (
                              <Draggable
                                key={op._id}
                                draggableId={op._id}
                                index={index}
                                isDragDisabled={op.status === 'Done' || op.status === 'Canceled'}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
                                    onClick={() => openModal(op)}
                                  >
                                    <div className="kcard-top">
                                      <span className="kcard-ref">{op.referenceNumber}</span>
                                      <span className="kcard-type" style={{ color: typeBadge.color, background: typeBadge.bg }}>
                                        {op.type}
                                      </span>
                                    </div>

                                    {(op.sourceLocation || op.destinationLocation) && (
                                      <div className="kcard-route">
                                        <span>{op.sourceLocation?.name || '—'}</span>
                                        <ArrowRight size={11} style={{ flexShrink: 0, opacity: 0.5 }} />
                                        <span>{op.destinationLocation?.name || '—'}</span>
                                      </div>
                                    )}

                                    {op.notes && (
                                      <p className="kcard-notes">{op.notes}</p>
                                    )}

                                    <div className="kcard-footer">
                                      <div className="kcard-items">
                                        <Package size={11} />
                                        {op.items.length} item{op.items.length !== 1 ? 's' : ''}
                                      </div>
                                      {op.createdAt && (
                                        <span className="kcard-date">{formatDate(op.createdAt)}</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>

      ) : (
        // ─── List View ───────────────────────────────────────────────────────
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Items</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allOperations.length === 0 ? (
                <tr className="ops-empty-row">
                  <td colSpan="8">
                    <div className="ops-empty-inner">
                      <ShoppingCart size={40} />
                      <span>No operations found</span>
                    </div>
                  </td>
                </tr>
              ) : allOperations.map(op => {
                const col = COLUMNS.find(c => c.id === op.status) || COLUMNS[0];
                const typeBadge = TYPE_BADGE[op.type] || {};
                return (
                  <tr key={op._id} onClick={() => openModal(op)} className="table-row-hover">
                    <td className="td-ref">{op.referenceNumber}</td>
                    <td>
                      <span className="type-pill" style={{ color: typeBadge.color, background: typeBadge.bg }}>
                        {op.type}
                      </span>
                    </td>
                    <td className="td-muted">{op.sourceLocation?.name || '—'}</td>
                    <td className="td-muted">{op.destinationLocation?.name || '—'}</td>
                    <td>
                      <span className="td-items-count">
                        <Package size={13} />{op.items.length}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill" style={{ color: col.color, background: col.bg }}>
                        {op.status}
                      </span>
                    </td>
                    <td className="td-muted" style={{ fontSize: '0.82rem' }}>{formatDate(op.createdAt)}</td>
                    <td style={{ textAlign: 'right', padding: '0.7rem 1.2rem' }}>
                      <button className="icon-btn" onClick={e => { e.stopPropagation(); openModal(op); }}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <h3 className="modal-title">
                  {isReadOnly
                    ? `Operation Details`
                    : viewingOp ? 'Edit Operation' : 'New Operation'}
                </h3>
                {viewingOp && (
                  <div className="modal-ref-badge">{viewingOp.referenceNumber}</div>
                )}

                {viewingOp && (
                  <div className="status-stepper">
                    {COLUMNS.filter(c => c.id !== 'Canceled').map((step, idx, arr) => {
                      const currentIndex = COLUMNS.findIndex(c => c.id === viewingOp.status);
                      const isDone = idx < currentIndex;
                      const isActive = step.id === viewingOp.status;
                      return (
                        <div key={step.id} className={`step ${isDone ? 'done' : isActive ? 'active' : 'upcoming'}`}>
                          <div className="step-dot">
                            {isDone ? <Check size={10} /> : null}
                          </div>
                          <div className="step-label">{step.label}</div>
                          {idx < arr.length - 1 && <div className="step-sep" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="modal-header-actions">
                {viewingOp && (
                  <button className="print-btn" onClick={handlePrint} type="button">
                    <Printer size={16} /> Print
                  </button>
                )}
                <button className="modal-close" onClick={closeModal}><X size={18} /></button>
              </div>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              {/* Type */}
              <div className="form-group span2">
                <label>Operation Type</label>
                <select
                  value={formData.type}
                  disabled={isReadOnly}
                  onChange={e => setFormData({ ...formData, type: e.target.value, sourceLocation: '', destinationLocation: '' })}
                  className="form-control"
                >
                  <option value="Receipt">Receipt — Vendor → Internal</option>
                  <option value="Delivery">Delivery — Internal → Customer</option>
                  <option value="Internal Transfer">Internal Transfer</option>
                  <option value="Adjustment">Inventory Adjustment</option>
                </select>
              </div>

              {/* Source */}
              {formData.type !== 'Receipt' && (
                <div className="form-group">
                  <label>From Location</label>
                  <select required value={formData.sourceLocation} disabled={isReadOnly}
                    onChange={e => setFormData({ ...formData, sourceLocation: e.target.value })}
                    className="form-control">
                    <option value="">Select location…</option>
                    {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
              )}

              {/* Destination */}
              {formData.type !== 'Delivery' && (
                <div className={`form-group ${formData.type === 'Receipt' ? 'span2' : ''}`}>
                  <label>To Location</label>
                  <select required value={formData.destinationLocation} disabled={isReadOnly}
                    onChange={e => setFormData({ ...formData, destinationLocation: e.target.value })}
                    className="form-control">
                    <option value="">Select location…</option>
                    {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
              )}

              {/* Items */}
              <div className="form-group span2 items-box">
                <div className="items-box-header">
                  <Package size={15} style={{ color: '#6366f1' }} />
                  Products / Items
                </div>
                {formData.items.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <select required value={item.product} disabled={isReadOnly}
                      onChange={e => handleItemChange(idx, 'product', e.target.value)}
                      className="form-control">
                      <option value="">Select product…</option>
                      {products.map(p => <option key={p._id} value={p._id}>[{p.sku}] {p.name}</option>)}
                    </select>
                    <input
                      type="number" min="0.01" step="0.01" value={item.quantity}
                      disabled={isReadOnly}
                      onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="form-control qty-input"
                      placeholder="Qty"
                    />
                    {!isReadOnly && (
                      <button type="button" onClick={() => removeItemRow(idx)} className="remove-item-btn">
                        <MinusCircle size={17} />
                      </button>
                    )}
                  </div>
                ))}
                {!isReadOnly && (
                  <button type="button" onClick={addItemRow} className="add-item-btn">
                    <PlusCircle size={15} /> Add item
                  </button>
                )}
              </div>

              {/* Notes */}
              <div className="form-group span2">
                <label>Notes</label>
                <textarea rows={3} value={formData.notes} disabled={isReadOnly}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="form-control"
                  placeholder="Optional internal notes…"
                />
              </div>

              {/* Footer */}
              <div className="modal-footer span2">
                <button type="button" onClick={closeModal} className="btn-ghost">Close</button>

                {!isReadOnly && viewingOp && ALLOWED_TRANSITIONS[viewingOp.status]?.map(nextStatus => {
                  const col = COLUMNS.find(c => c.id === nextStatus);
                  return (
                    <button key={nextStatus} type="button" className="btn-status"
                      style={{ '--s-color': col.color, '--s-bg': col.bg }}
                      onClick={() => handleStatusChange(viewingOp, nextStatus)}>
                      {nextStatus === 'Done'
                        ? <><Check size={13} /> Validate</>
                        : `→ ${nextStatus}`}
                    </button>
                  );
                })}

                {!isReadOnly && (
                  <button type="submit" className="btn-primary">
                    {viewingOp ? 'Save Changes' : 'Draft Operation'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Operations;

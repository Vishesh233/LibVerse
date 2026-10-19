import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { LogoMark } from './LogoMark';
import { QrCode } from './QrCode';
import { Button, EmptyState, Skeleton } from './UI';
import { BACK, CARD_H, FRONT, ROLE_LABEL, SPINES, initialsOf, memberSince, rulesOf } from '../utils/cardArt';
import { downloadCardPngs } from '../utils/cardCanvas';
import { assetUrl } from '../utils/assetUrl';

// Card units -> CSS container units (the card is the container: 1u = 1cqw)
const cq = (n) => `${n}cqw`;
const at = ({ x, y }) => ({ left: cq(x), top: cq(y) });
const size = (s) => ({ fontSize: cq(s) });

/** Navy background, hairlines and book spines (one SVG, so screen, print and PNG match) */
const CardArt = ({ holo }) => (
  <>
    <span className="lv-card__bg" aria-hidden="true" />
    <svg className="lv-card__pattern" viewBox={`0 0 100 ${CARD_H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {Array.from({ length: 33 }, (_, i) => <rect key={`l${i}`} x={1.5 + i * 3} y="0" width="0.1" height={CARD_H} fill="#fff" opacity="0.022" />)}
      {SPINES.map(([x, w, h, a]) => (
        <rect key={`s${x}`} x={x} y={CARD_H - FRONT.accentH - h} width={w} height={h} rx="0.4" fill="#fff" opacity={a} />
      ))}
    </svg>
    {holo && <span className="lv-card__holo" style={{ top: cq(FRONT.holo.y), height: cq(FRONT.holo.h) }} aria-hidden="true" />}
    <span className="lv-card__accent" style={{ height: cq(FRONT.accentH) }} aria-hidden="true" />
  </>
);

const Wordmark = ({ x, y, s }) => (
  <span className="lv-card__text lv-card__word" style={{ ...at({ x, y }), ...size(s) }}>
    Lib<span className="lv-card__verse">Verse</span>
  </span>
);

const Logo = ({ x, y, tile, radius, icon }) => (
  <span className="lv-card__logo" style={{ ...at({ x, y }), '--lv-tile': cq(tile), '--lv-radius': cq(radius), '--lv-icon': cq(icon) }}>
    <LogoMark size="sm" />
  </span>
);

/** Front: avatar, brand, name, role, Library ID, member since, QR with the logo in the centre */
export const CardFront = ({ card }) => {
  const [photoFailed, setPhotoFailed] = useState(false);
  const photo = card.profileImage && !photoFailed ? assetUrl(card.profileImage) : null;
  const { avatar } = FRONT;
  return (
    <div className="lv-card">
      <CardArt holo />
      <Logo x={FRONT.logo.x} y={FRONT.logo.y} tile={FRONT.logo.size} radius={FRONT.logo.radius} icon={FRONT.logo.icon} />
      <Wordmark x={FRONT.word.x} y={FRONT.word.y} s={FRONT.word.size} />
      <span className="lv-card__text lv-card__label" style={{ ...at(FRONT.sub), ...size(FRONT.sub.size) }}>Library card</span>

      <span className="lv-card__avatar" style={{ ...at(avatar), width: cq(avatar.d), height: cq(avatar.d), '--lv-ring': cq(avatar.ring) }}>
        {photo ? <img src={photo} alt="" onError={() => setPhotoFailed(true)} /> : <span style={size(avatar.d * 0.38)}>{initialsOf(card.name)}</span>}
      </span>
      <span className="lv-card__text lv-card__name" style={{ ...at(FRONT.name), ...size(FRONT.name.size), maxWidth: cq(FRONT.name.maxW) }}>{card.name}</span>
      <span
        className="lv-card__text lv-card__role"
        style={{ ...at(FRONT.role), ...size(FRONT.role.size), height: cq(FRONT.role.h), padding: `0 ${cq(FRONT.role.padX)}` }}
      >
        {ROLE_LABEL[card.role] || card.role}
      </span>

      <span className="lv-card__text lv-card__label" style={{ ...at(FRONT.idLabel), ...size(FRONT.idLabel.size) }}>Library ID</span>
      <span className="lv-card__text lv-card__id" style={{ ...at(FRONT.id), ...size(FRONT.id.size) }}>{card.libraryId}</span>
      <span className="lv-card__text lv-card__label" style={{ ...at(FRONT.sinceLabel), ...size(FRONT.sinceLabel.size) }}>Member since</span>
      <span className="lv-card__text lv-card__since" style={{ ...at(FRONT.since), ...size(FRONT.since.size) }}>{memberSince(card.memberSince)}</span>

      <span className="lv-card__qr" style={{ ...at(FRONT.qr), width: cq(FRONT.qr.size), height: cq(FRONT.qr.size), borderRadius: cq(FRONT.qr.radius), padding: cq(FRONT.qr.pad) }}>
        <QrCode value={card.code} logo title={`Library card QR code for ${card.libraryId}`} />
      </span>
      <span
        className="lv-card__text lv-card__caption"
        style={{ left: cq(FRONT.qr.x), width: cq(FRONT.qr.size), top: cq(FRONT.caption.y), ...size(FRONT.caption.size) }}
      >
        Show at the library desk
      </span>
    </div>
  );
};

/** Back: lending rules, "if found", card version and a small QR */
export const CardBack = ({ card }) => {
  const rules = rulesOf(card.rules);
  const b = BACK.brand;
  return (
    <div className="lv-card">
      <CardArt holo={false} />
      <span className="lv-card__stripe" style={{ top: cq(BACK.stripe.y), height: cq(BACK.stripe.h) }} aria-hidden="true" />
      <span className="lv-card__text lv-card__title" style={{ ...at(BACK.title), ...size(BACK.title.size) }}>Library rules</span>
      {rules.map((rule, i) => (
        <span key={rule} className="lv-card__text lv-card__rule" style={{ left: cq(BACK.rules.x), top: cq(BACK.rules.y + i * BACK.rules.step), ...size(BACK.rules.size), '--lv-dot': cq(BACK.rules.dot) }}>
          {rule}
        </span>
      ))}
      <span className="lv-card__text lv-card__found" style={{ ...at(BACK.found), ...size(BACK.found.size), width: cq(BACK.found.maxW) }}>
        If found, please return to the library desk.
      </span>
      <Logo x={b.x} y={b.y} tile={b.tile} radius={b.radius} icon={b.icon} />
      <Wordmark x={b.wordX} y={b.y + (b.tile - b.wordSize) / 2} s={b.wordSize} />
      <span className="lv-card__text lv-card__muted" style={{ ...at(BACK.version), ...size(BACK.version.size) }}>
        Card version {card.cardVersion} · <span className="font-mono">{card.libraryId}</span>
      </span>
      <span
        className="lv-card__text lv-card__label lv-card__caption"
        style={{ left: cq(BACK.qr.x), width: cq(BACK.qr.size), top: cq(BACK.qrLabel.y), ...size(BACK.qrLabel.size) }}
      >
        Scan at the desk
      </span>
      <span className="lv-card__qr" style={{ ...at(BACK.qr), width: cq(BACK.qr.size), height: cq(BACK.qr.size), borderRadius: cq(BACK.qr.radius), padding: cq(BACK.qr.pad) }}>
        <QrCode value={card.code} />
      </span>
    </div>
  );
};

/** Screen card: click, Enter or Space flips it (3D, or an instant swap with reduced motion) */
export const FlipCard = ({ card, flipped, onFlip }) => (
  <div className="lv-flip" data-flipped={flipped || undefined}>
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`Library card, showing the ${flipped ? 'back' : 'front'}. Press to flip.`}
      className="lv-flip__inner"
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFlip();
        }
      }}
    >
      <div className="lv-flip__face" aria-hidden="true" inert={flipped ? '' : undefined}>
        <CardFront card={card} />
      </div>
      <div className="lv-flip__face lv-flip__face--back" aria-hidden="true" inert={flipped ? undefined : ''}>
        <CardBack card={card} />
      </div>
    </div>
  </div>
);

/** Print: both sides at real size (85.6 x 54 mm) on one A4 page with crop marks */
const PrintSheet = ({ card }) => createPortal(
  <div className="lv-print-sheet" aria-hidden="true">
    {[['Front', <CardFront key="f" card={card} />], ['Back', <CardBack key="b" card={card} />]].map(([side, face]) => (
      <figure key={side} className="lv-print-slot">
        <span className="lv-crop lv-crop--tl" /><span className="lv-crop lv-crop--tr" />
        <span className="lv-crop lv-crop--bl" /><span className="lv-crop lv-crop--br" />
        {face}
        <figcaption>{side} · cut along the marks</figcaption>
      </figure>
    ))}
  </div>,
  document.body
);

/** Profile section: loads the signed-in member's card, with Flip, Download and Print */
export const LibraryCardPanel = () => {
  const [state, setState] = useState({ loading: true, card: null, error: null });
  const [flipped, setFlipped] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await authAPI.getMyCard();
      setState({ loading: false, card: res.data.card, error: null });
    } catch (err) {
      setState({ loading: false, card: null, error: err.response?.data?.message || 'Your card could not be loaded. Please try again.' });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // While the card is on screen, printing (button or Ctrl+P) prints only the card sheet
  useEffect(() => {
    if (!state.card) return undefined;
    const root = document.documentElement;
    const on = () => root.classList.add('printing-card');
    const off = () => root.classList.remove('printing-card');
    window.addEventListener('beforeprint', on);
    window.addEventListener('afterprint', off);
    return () => {
      window.removeEventListener('beforeprint', on);
      window.removeEventListener('afterprint', off);
      off();
    };
  }, [state.card]);

  const print = () => {
    document.documentElement.classList.add('printing-card');
    window.print();
  };

  const download = async () => {
    if (!state.card) return;
    setDownloading(true);
    try {
      await downloadCardPngs(state.card);
      toast.success('Saved the front and back of your card (300 DPI PNG).');
    } catch {
      toast.error('The card image could not be created. Try Print instead.');
    } finally {
      setDownloading(false);
    }
  };

  if (state.loading) return <Skeleton className="mx-auto aspect-[1.586/1] w-full max-w-[440px] !rounded-[18px]" />;
  if (state.error) {
    return <EmptyState bare icon="🪪" title="No library card yet" message={state.error} action={<Button fullWidth={false} variant="secondary" onClick={load}>Try again</Button>} />;
  }

  const { card } = state;
  return (
    <div className="space-y-5">
      <FlipCard card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
      <dl className="sr-only">
        <dt>Name</dt><dd>{card.name}</dd>
        <dt>Role</dt><dd>{ROLE_LABEL[card.role] || card.role}</dd>
        <dt>Library ID</dt><dd>{card.libraryId}</dd>
        <dt>Member since</dt><dd>{memberSince(card.memberSince)}</dd>
        <dt>Card version</dt><dd>{card.cardVersion}</dd>
      </dl>
      <div className="flex flex-wrap justify-center gap-2">
        <Button fullWidth={false} variant="secondary" onClick={() => setFlipped((f) => !f)} aria-pressed={flipped}>
          {flipped ? 'Show front' : 'Flip card'}
        </Button>
        <Button fullWidth={false} onClick={download} loading={downloading}>Download PNG</Button>
        <Button fullWidth={false} variant="secondary" onClick={print}>Print</Button>
      </div>
      <p className="mx-auto max-w-md text-center text-xs text-slate-400">
        Show this QR code at the library desk to borrow and return books. Print uses the real card size; Download saves the front and back as 300 DPI images. If your card is lost, ask an admin to reissue it and the old code stops working.
      </p>
      <PrintSheet card={card} />
    </div>
  );
};

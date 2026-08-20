const KVKK_URL = process.env.NEXT_PUBLIC_KVKK_URL;

function KvkkNotice() {
  return (
    <p className="text-prose-ink text-center text-xs leading-relaxed">
      Kişisel Verilerin İşlenmesi Hakkında ayrıntılı bilgi için{" "}
      {KVKK_URL ? (
        <a
          href={KVKK_URL}
          target="_blank"
          rel="noreferrer"
          className="text-brand font-medium hover:underline"
        >
          tıklayınız.
        </a>
      ) : (
        <span className="font-medium">aydınlatma metnimizi inceleyiniz.</span>
      )}
    </p>
  );
}

export { KvkkNotice };

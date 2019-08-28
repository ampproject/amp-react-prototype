
export default function AmpElementFactory(BaseElement) {
  return class AmpElement extends HTMLElement {
    constructor() {
      super(...arguments)

      this.implementation_ = new BaseElement(this);
      this.intersection_ = null;
      this.mutations_ = null;
    }

    connectedCallback() {
      this.implementation_.buildCallback();

      const io = new IntersectionObserver((records) => {
        for (const r of records) {
          if (r.isIntersecting) {
            this.implementation_.layoutCallback();
            break;
          }
        }
      });
      this.intersection_ = io;
      io.observe(this);

      const mo = new MutationObserver((records) => {
        const map = { __proto__: null };
        for (const r of records) {
          const { attributeName } = r;
          map[attributeName] = this.getAttribute(attributeName);
        }

        this.implementation_.mutatedAttributesCallback(map);
      });
      this.mutations_ = mo;
      mo.observe(this, { attributes: true });
    }

    disconnectedCallback() {
      this.intersection_.disconnect();
      this.intersection_ = null;
      this.mutations_.disconnect();
      this.mutations_ = null;
    }
  }
}

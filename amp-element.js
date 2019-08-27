
export default function AmpElementFactory(BaseElement) {
  return class AmpElement extends HTMLElement {
    constructor() {
      super(...arguments)

      this.implementation_ = new BaseElement(this);
      this.observer_ = null;
    }

    connectedCallback() {
      this.implementation_.buildCallback();

      const observer = new IntersectionObserver((records) => {
        for (const r of records) {
          if (r.isIntersecting) {
            this.implementation_.layoutCallback();
            break;
          }
        }
      });
      this.observer_ = observer;
      observer.observe(this);
    }

    disconnectedCallback() {
      this.observer_.disconnect();
      this.observer_ = null;
    }
  }
}

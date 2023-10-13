class RoflParseService {
  //

  private getSignatures() {
    return [0x52, 0x49, 0x4f, 0x54, 0x00, 0x00];
  }

  private checkFileSignature(header_bytes: Uint8Array): boolean {
    let signatures = this.getSignatures();
    for (let i = 0; i < signatures.length; i++) {
      if (signatures[i] !== header_bytes[i]) {
        return false;
      }
    }
    return true;
  }
}

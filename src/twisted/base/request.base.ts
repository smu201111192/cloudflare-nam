import ky, { Options } from "ky";
import Queue from "p-queue";
// import Queue from 'promise-queue'

export class RequestBase {
  static queue: Queue;

  private static async sendRequest(url: string, options: Options) {
    //@ts-ignore
    const r = await ky.get(url, { ...options, credentials: undefined });
    return r.json();
  }

  private static getQueue() {
    if (!RequestBase.queue) {
      RequestBase.queue = new Queue();
    }
    return RequestBase.queue;
  }

  static setConcurrency(concurrency: number) {
    RequestBase.queue = new Queue({ concurrency });
  }

  static request<T>(url: string, options: Options): Promise<T> {
    return RequestBase.getQueue().add(
      () => RequestBase.sendRequest(url, options) as any
    );
  }
}

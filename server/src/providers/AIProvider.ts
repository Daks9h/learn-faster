export interface AIProvider {
  /**
   * Generates raw study material object from lecture text.
   * May receive retry errors from prior validation failure.
   * Optional onProgress callback reports percentage (0-100) and stage message.
   */
  generateStudyMaterial(
    text: string, 
    retryErrors?: string[], 
    onProgress?: (percent: number, message: string) => void
  ): Promise<unknown>;
}

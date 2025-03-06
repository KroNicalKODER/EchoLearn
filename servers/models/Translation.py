from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

checkpoint_path = ".\ML_modals\checkpoint-1100"

model = AutoModelForSeq2SeqLM.from_pretrained(checkpoint_path)
tokenizer = AutoTokenizer.from_pretrained(checkpoint_path)

def translate_text(text):
    inputs = tokenizer(text, return_tensors="pt")
    output_ids = model.generate(**inputs, max_length=64)
    response = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return response



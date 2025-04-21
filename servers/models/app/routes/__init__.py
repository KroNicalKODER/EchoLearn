from .audio_routes import audio_bp
from .exercise_routes import exercise_bp
from .llama_routes import llama_bp
from .translation_routes import translation_bp


def register_routes(app):
    app.config["ENV"] = "development"
    app.config["DEBUG"] = True
    app.register_blueprint(audio_bp)
    app.register_blueprint(exercise_bp)
    app.register_blueprint(llama_bp)
    app.register_blueprint(translation_bp)

using System.Collections.Generic;

namespace GameCult.Eve.PluginFields
{
    public static class EveFieldsSchemas
    {
        public const string Surface2D = "gamecult.fields.surface2d.v1";
        public const string Objects = "gamecult.fields.objects.v1";
        public const string Gravity = "gamecult.fields.gravity.v1";
        public const string Splats = "gamecult.fields.splats.v1";
    }

    public static class EveFieldsSplatChannels
    {
        public const int Visibility = 0;
        public const int Gravity = 1;
        public const int GravityWave = 2;
        public const int Influence = 3;
        public const int Tint = 4;
    }

    public static class EveFieldsSplatLayerKeys
    {
        public const string GravityHeight = "gravity.height";
        public const string GravityWave = "gravity.wave";
        public const string Visibility = "visibility.mask";
        public const string FogSurfaceHeight = "fog.surface_height";
        public const string FogPatchHeight = "fog.patch_height";
        public const string FogPatch = "fog.patch";
        public const string FogTint = "fog.tint";
        public const string Influence = "influence.mask";
    }

    public static class EveFieldsSplatBlendModes
    {
        public const string Add = "add";
        public const string Max = "max";
        public const string Alpha = "alpha";
    }

    public static class EveFieldsSplatSourceKinds
    {
        public const int Constant = 0;
        public const int SimplexNoise = 1;
        public const int AnimatedSimplexNoise = 2;
        public const int AnimatedCellNoiseB = 3;
        public const int AnimatedRadialCosine = 4;
    }

    public static class EveFieldsSplatSourceFlags
    {
        public const int AbsoluteValue = 1;
    }

    public static class EveFieldsSplatFalloffs
    {
        public const int Solid = 0;
        public const int Linear = 1;
        public const int Smooth = 2;
        public const int InverseSmooth = 3;
        public const int PowerPulse = 4;
    }

    public interface IEveFieldsViewport
    {
        double MinX { get; }
        double MinY { get; }
        double MaxX { get; }
        double MaxY { get; }
    }

    public interface IEveFieldsSplatLayer
    {
        string LayerKey { get; }
        string DisplayName { get; }
        int Channel { get; }
        string BlendMode { get; }
        string GraphicsFormat { get; }
        bool ClearBeforeDraw { get; }
        double ClearR { get; }
        double ClearG { get; }
        double ClearB { get; }
        double ClearA { get; }
    }

    public interface IEveFieldsSplatSoa
    {
        int Count { get; }
        IReadOnlyList<double> CenterX { get; }
        IReadOnlyList<double> CenterY { get; }
        IReadOnlyList<double> HalfExtentX { get; }
        IReadOnlyList<double> HalfExtentY { get; }
        IReadOnlyList<double> RotationCos { get; }
        IReadOnlyList<double> RotationSin { get; }
        IReadOnlyList<int> Channel { get; }
        IReadOnlyList<int> Falloff { get; }
        IReadOnlyList<double> ValueR { get; }
        IReadOnlyList<double> ValueG { get; }
        IReadOnlyList<double> ValueB { get; }
        IReadOnlyList<double> ValueA { get; }
        IReadOnlyList<string> SourceKey { get; }
        IReadOnlyList<int> LayerIndex { get; }
        IReadOnlyList<int> SourceKind { get; }
        IReadOnlyList<double> FrequencyX { get; }
        IReadOnlyList<double> FrequencyY { get; }
        IReadOnlyList<double> PhaseX { get; }
        IReadOnlyList<double> PhaseY { get; }
        IReadOnlyList<double> AnimationSpeed { get; }
        IReadOnlyList<double> SourceFlags { get; }
        IReadOnlyList<double> FalloffScale { get; }
        IReadOnlyList<double> FalloffExponent { get; }
    }

    public interface IEveFieldsSplatsDocument
    {
        string Schema { get; }
        long FrameId { get; }
        double SimulationTimeSeconds { get; }
        IEveFieldsViewport Viewport { get; }
        IReadOnlyList<IEveFieldsSplatLayer> Layers { get; }
        IEveFieldsSplatSoa Splats { get; }
    }
}

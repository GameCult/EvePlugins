using System;
using System.Collections.Generic;
using GameCult.Caching;
using MessagePack;

namespace GameCult.Eve.PluginFields
{
    [CultDocument("gamecult.fields.splats", EveFieldsSchemas.Splats)]
    [MessagePackObject]
    public sealed class EveFieldsSplatsDocument : IEveFieldsSplatsDocument
    {
        [Key(0)] public string Schema { get; set; } = EveFieldsSchemas.Splats;
        [Key(1)] public long FrameId { get; set; }
        [Key(2)] public string PublishedAtUtc { get; set; } = "";
        [Key(3)] public double SimulationTimeSeconds { get; set; }
        [Key(4)] public string RunId { get; set; } = "";
        [Key(5)] public int ZoneIndex { get; set; }
        [Key(6)] public string ZoneName { get; set; } = "";
        [Key(7)] public EveFieldsViewport Viewport { get; set; } = new EveFieldsViewport();
        [Key(8)] public IReadOnlyList<EveFieldsSplatLayer> Layers { get; set; } = Array.Empty<EveFieldsSplatLayer>();
        [Key(9)] public EveFieldsSplatSoa Splats { get; set; } = new EveFieldsSplatSoa();

        IEveFieldsViewport IEveFieldsSplatsDocument.Viewport => Viewport;
        IReadOnlyList<IEveFieldsSplatLayer> IEveFieldsSplatsDocument.Layers => Layers;
        IEveFieldsSplatSoa IEveFieldsSplatsDocument.Splats => Splats;
    }

    [MessagePackObject]
    public sealed class EveFieldsViewport : IEveFieldsViewport
    {
        [Key(0)] public double MinX { get; set; }
        [Key(1)] public double MinY { get; set; }
        [Key(2)] public double MaxX { get; set; }
        [Key(3)] public double MaxY { get; set; }
    }

    [MessagePackObject]
    public sealed class EveFieldsSplatLayer : IEveFieldsSplatLayer
    {
        [Key(0)] public string LayerKey { get; set; } = "";
        [Key(1)] public string DisplayName { get; set; } = "";
        [Key(2)] public int Channel { get; set; }
        [Key(3)] public string BlendMode { get; set; } = EveFieldsSplatBlendModes.Add;
        [Key(4)] public string GraphicsFormat { get; set; } = "R16_SFloat";
        [Key(5)] public bool ClearBeforeDraw { get; set; } = true;
        [Key(6)] public double ClearR { get; set; }
        [Key(7)] public double ClearG { get; set; }
        [Key(8)] public double ClearB { get; set; }
        [Key(9)] public double ClearA { get; set; }
    }

    [MessagePackObject]
    public sealed class EveFieldsSplatSoa : IEveFieldsSplatSoa
    {
        [Key(0)] public int Count { get; set; }
        [Key(1)] public IReadOnlyList<double> CenterX { get; set; } = Array.Empty<double>();
        [Key(2)] public IReadOnlyList<double> CenterY { get; set; } = Array.Empty<double>();
        [Key(3)] public IReadOnlyList<double> HalfExtentX { get; set; } = Array.Empty<double>();
        [Key(4)] public IReadOnlyList<double> HalfExtentY { get; set; } = Array.Empty<double>();
        [Key(5)] public IReadOnlyList<double> RotationCos { get; set; } = Array.Empty<double>();
        [Key(6)] public IReadOnlyList<double> RotationSin { get; set; } = Array.Empty<double>();
        [Key(7)] public IReadOnlyList<int> Channel { get; set; } = Array.Empty<int>();
        [Key(8)] public IReadOnlyList<int> Falloff { get; set; } = Array.Empty<int>();
        [Key(9)] public IReadOnlyList<double> ValueR { get; set; } = Array.Empty<double>();
        [Key(10)] public IReadOnlyList<double> ValueG { get; set; } = Array.Empty<double>();
        [Key(11)] public IReadOnlyList<double> ValueB { get; set; } = Array.Empty<double>();
        [Key(12)] public IReadOnlyList<double> ValueA { get; set; } = Array.Empty<double>();
        [Key(13)] public IReadOnlyList<string> SourceKey { get; set; } = Array.Empty<string>();
        [Key(14)] public IReadOnlyList<int> LayerIndex { get; set; } = Array.Empty<int>();
        [Key(15)] public IReadOnlyList<int> SourceKind { get; set; } = Array.Empty<int>();
        [Key(16)] public IReadOnlyList<double> FrequencyX { get; set; } = Array.Empty<double>();
        [Key(17)] public IReadOnlyList<double> FrequencyY { get; set; } = Array.Empty<double>();
        [Key(18)] public IReadOnlyList<double> PhaseX { get; set; } = Array.Empty<double>();
        [Key(19)] public IReadOnlyList<double> PhaseY { get; set; } = Array.Empty<double>();
        [Key(20)] public IReadOnlyList<double> AnimationSpeed { get; set; } = Array.Empty<double>();
        [Key(21)] public IReadOnlyList<double> SourceFlags { get; set; } = Array.Empty<double>();
        [Key(22)] public IReadOnlyList<double> FalloffScale { get; set; } = Array.Empty<double>();
        [Key(23)] public IReadOnlyList<double> FalloffExponent { get; set; } = Array.Empty<double>();
    }
}
